import type { Request, Response, NextFunction } from 'express';
import User from '../../models/user.model';
import sendEmail from '../../utils/sendMail';
import Cart from '../../models/shop/cart.model';
import Comment from '../../models/shop/comment.model';
import Inventory from '../../models/shop/inventory.model';
import WishList from '../../models/shop/whishList.model';
import Product from '../../models/shop/product.model';
import Address from '../../models/address.model';
import Report from '../../models/report.model';
import Role from '../../models/role';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { redis } from '../../db/redis';
import type { ICommentModel, IReportModel } from '../../types';

export const activeUsers = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const keys = await redis.keys('user:*');
        const users = await Promise.all(keys.map(async (key : string) => {

            const data = await redis.get(key);
            const user = JSON.parse(data!);
            return user;
        }));

        res.status(200).json({success : true, users});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const users = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const keys = await redis.keys('user:*');
        const users = await Promise.all(keys.map(async (key : string) => {

            const user = key.slice(5);
            return user;
        }));

        const user = await User.find();
        const filteredUsers = user.filter(user => user._id.toString() !== users.toString());

        res.status(200).json({success : true, filteredUsers});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const ban = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : userId } = req.params;

        const user = await User.findOneAndUpdate({_id : userId, role : ['user', 'seller'], isBan : false}, {$set : {isBan : true}}, {new : true});

        if(!user) return next(new ErrorHandler('Error in ban request, check user role not be admin or check user is ban or not', 400));
        if(user) await redis.del(`user:${user._id}`);

        await sendEmail({
            email: user.email,
            subject: 'Your Account Has Been Banned',
            text: 'Your account has been banned due to a violation of our website policies. If you have any questions or believe this is a mistake, please contact us.',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #FF0000;">Your Account Has Been Banned</h2>
                <p>We regret to inform you that your account has been banned due to a violation of our website policies. This action was taken after careful consideration and review of the infraction.</p>
                <p>If you have any questions or believe this is a mistake, please contact our support team as soon as possible.</p>
                <p>Best regards,<br>The Support Team</p>
              </div>
            `
          });

        res.status(200).json({success : true, message : `User ${user.email} has been ban`});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const delSellerAccount = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : userId } = req.params;

        const data = await redis.get(`user:${userId}`);
        if(data) {
            const user = JSON.parse(data!);
            if(user.role === 'admin' || user.role === 'seller') return next(new ErrorHandler('this endpoint is for role seller only', 400));
            
        }else {
            const user = await User.findById(userId);
            if(user?.role === 'admin' || user?.role === 'seller') return next(new ErrorHandler('this endpoint is for role seller only', 400));
        }

        const keys = await redis.keys(`product:*`);
        const products = await Promise.all(keys.map(async (key : string) => {

            const data = await redis.get(key);
            const product = JSON.parse(data!);

            const regex = new RegExp(userId);
            if(regex.test(product.user)) {
                const productId = key.slice(8);
                
                await Promise.all([Cart.updateMany({}, {$pull : {products : {product : productId}}}), Comment.deleteMany({productId}),
                    Inventory.deleteMany({productId}), WishList.updateMany({}, {$pull : {products : {product : productId}}}),
                    Product.deleteMany({_id : productId}), redis.del(`product:${productId}`), redis.del(`comments:${productId}`)
                ]);
            }
        }));

        await Promise.all([Address.deleteMany({user : userId}), Comment.deleteMany({senderId : userId}), 
            Cart.deleteOne({user : userId}), WishList.deleteOne({user : userId}), Report.updateMany({reportersId : userId}),
            Role.deleteMany({userId}), redis.del(`user:${userId}`), redis.del(`wishList:${userId}`),
            Comment.updateMany({replies : {userId}}, {$pull : {replies : {userId}}})
        ]);

        await User.deleteOne({_id : userId}),

        res.status(200).json({success : true, message : 'User has been deleted successfully'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const delUsersAccount = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : userId } = req.params;

        const data = await redis.get(`user:${userId}`);
        if(data) {
            const user = JSON.parse(data!);
            if(user.role === 'admin' || user.role === 'seller') return next(new ErrorHandler('this endpoint is for role user only', 400));
            
        }else {
            const user = await User.findById(userId);
            if(user?.role === 'admin' || user?.role === 'seller') return next(new ErrorHandler('this endpoint is for role user only', 400));
        }

        await Promise.all([Address.deleteMany({user : userId}), Comment.deleteMany({senderId : userId}), 
            Cart.deleteOne({user : userId}), WishList.deleteOne({user : userId}), Report.updateMany({reportersId : userId}),
            Role.deleteMany({userId}), redis.del(`user:${userId}`), redis.del(`wishList:${userId}`),
            Comment.updateMany({replies : {userId}}, {$pull : {replies : {userId}}}),
        ]);

        await User.deleteOne({_id : userId}),

        res.status(200).json({success : true, message : 'User has been deleted successfully'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const deleteProduct = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : productId } = req.params;

        await Promise.all([Cart.updateMany({$pull : {products : {product : productId}}}), Comment.deleteMany({productId}), 
            Inventory.deleteMany({productId}), WishList.updateMany({products : {product : productId}})
        ]);

        await Product.deleteOne({_id : productId});
        await redis.del(`product:${productId}`);

        res.status(200).json({success : true, message : 'Product deleted successfully'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const checkReports = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const keys = await redis.keys(`user:*`);
        const userId = await Promise.all(keys.map(async (key : string) => {

            const id = key.slice(5);
            return id;
        }));

        const reports = await Report.find({user : userId});
        const report = reports.map((report : IReportModel) => {

            return { _id : report._id, reports : report.reportersId.length, };
        });

        res.status(200).json({success : true, user : report});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const getTopProducts = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const requestCountKey = `product:requests`;
        const topProductIds = await redis.zrevrange(requestCountKey, 0, 9, 'WITHSCORES');

        const topProducts = [];
        // response have 2 value for each item the productId and request number like this 'productId', 50 so each product is 2 item this mean 
        for(let i = 0; i < topProductIds.length; i += 2) {
            const productId = topProductIds[i]; // 0 = product1, 2 = product2, 
            const requestCount = topProductIds[i + 1]; // 1 = product1 request count, 3 = product2 request count

            const data = await redis.get(`product:${productId}`);
            const product = JSON.parse(data!);

            topProducts.push({requestCount, product});
        }

        res.status(200).json({success : true, products : topProducts});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const comments = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const comments = await Comment.find().populate('productId senderId');

        const comment = comments.map((comment : ICommentModel) => {
            const product = comment.productId
            const user = comment.senderId;

            return {
                productId : product._id, name : product.name, senderId : user._id, email : user.email, text : comment.text
            }
        });

        res.status(200).json({success : true, comment});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});