import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import WishList from '../../models/shop/whishList.model';
import { redis } from '../../db/redis';

export const addToWishList = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : productId } = req.params;
        const userId = req.user?._id;

        let wishList = await WishList.findOne({user : userId});
        if(!wishList) {
            wishList = await WishList.create({user : userId, products : {product : productId}});
            await redis.set(`wishList:${userId}`, JSON.stringify(wishList), 'EX', 3600);

            return res.status(200).json({success : true, message : 'Product added to your wishList', wishList});
        }

        const isProductExists = wishList.products.find(product => product.product.toString() === productId);
        if(isProductExists) return next(new ErrorHandler('Product already exists in your wishList', 400));

        wishList.products.push({product : productId});
        await wishList.save();

        res.status(200).json({success : true, wishList});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const wishList = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userId = req.user?._id;

        const cache = await redis.get(`wishList:${userId}`);
        if(cache) {
            const wishList = JSON.parse(cache);
            return res.status(200).json({success : true, wishList});
        }

        const wishList = await WishList.findOne({user : userId}).populate({
            path : 'products', populate : {path : 'product', model : 'Product'}
        });

        const mappedData = wishList?.products.map(product => {
            
            return {
                _id : wishList._id,
                name : product.product.name,
                price : product.product.price,
                description : product.product.description,
                images : product.product.images
            }
        });

        await redis.set(`wishList:${userId}`, JSON.stringify(mappedData), 'EX', 3600);

        return res.status(200).json({success : true, wishList : mappedData});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const removeWishList = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : productId } = req.params;
        const userId = req.user?._id;

        await WishList.findOneAndUpdate({user : userId}, {$pull : {products : {product : productId}}});

        await redis.del(`wishList:${userId}`);

        res.status(200).json({success : true, message : 'Product removed from your wishList'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});