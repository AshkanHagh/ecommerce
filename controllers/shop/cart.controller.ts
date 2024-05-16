import type { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import type { ICartBody, ICartMap, ICartModel, IProductModel } from '../../types';
import Inventory from '../../models/shop/inventory.model';
import WishList from '../../models/shop/whishList.model';
import Cart from '../../models/shop/cart.model';
import { redis } from '../../db/redis';

export const addToCart = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : productId } = req.params;
        const { quantity } = req.body as ICartBody;
        const userId = req.user?._id;

        const inventory = await Inventory.findOne({productId});
        if(inventory!.availableQuantity <= quantity) return next(new ErrorHandler('Not enough product available', 400));

        await WishList.findOneAndUpdate({user : userId}, {$pull : {products : {product : productId}}});

        let cart = await Cart.findOne({user : userId});
        if(!cart) {
            const productToAdd = { product: productId, quantity: quantity };
            cart = await Cart.create({user: userId, products : [productToAdd]});

            return res.status(200).json({success : true, message : 'Product added to your cart', cart});
        }

        const isProductExistsOnCart = cart.products.findIndex(item => item.product.toString() === productId);

        if(isProductExistsOnCart !== -1) {
            cart.products[isProductExistsOnCart].quantity+=quantity;
        }else {
            cart.products.push({product : productId, quantity});
        }

        await cart.save();

        return res.status(200).json({success : true, message : 'Product added to your cart', cart});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const cart = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userId = req.user?._id;

        const cache = await redis.get(`cart:${userId}`);
        if(cache) {

            const cart = JSON.parse(cache);
            return res.status(200).json({success : true, cart});
        }

        const cart = await Cart.findOne({user : userId}).populate({
            path : 'products', populate : {path : 'product', model : 'Product'}
        });

        const mappedData = cart?.products.map((products : ICartMap) => {
            const product = products.product;
            const totalPrice = products.quantity * product.price;

            return {
                _id : cart._id, name : product.name, price : product.price, images : product.images, 
                quantity : products.quantity, totalPrice
            }
        });

        await redis.set(`cart:${userId}`, JSON.stringify(mappedData), 'EX', 1800);

        res.status(200).json({success : true, cart : mappedData});

    } catch (error : any) {
        return next (new ErrorHandler(error.message, 400));
    }
})

export const removeCart = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : productId } = req.params;
        const userId = req.user?._id;

        const cart = await Cart.findOne({user : userId});

        const productIndex = cart?.products.findIndex(product => product.product.toString() === productId);

        if(productIndex !== -1 && cart!.products[productIndex!].quantity > 1) {
            cart!.products[productIndex!].quantity -= 1;
        }else {
            cart?.products.splice(productIndex!, 1);
        }

        await cart?.save();
        await redis.del(`cart:${userId}`);

        res.status(200).json({success : true, cart});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});