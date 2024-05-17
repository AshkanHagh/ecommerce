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
import type { IPagination } from '../../types';

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