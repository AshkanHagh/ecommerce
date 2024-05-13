import type { NextFunction, Request, Response } from 'express';
import WishList from '../../models/shop/whishList.model';
import type { IWishList, IWishListDocument } from '../../types';

export const addToWishList = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { productId } = req.body;
        const userId : string = req.user._id;

        let wishList : IWishList | null = await WishList.findOne({user : userId});

        if(!wishList) {
            wishList = await WishList.create({user : userId});
        }

        if(wishList.products.find(item => item.product.toString() === productId)) 
            return res.status(400).json({error : 'Product already exists on your wishList'});

        wishList.products.push({product : productId});

        await wishList.save();

        res.status(200).json({message : 'Product added to your wishList'});

    } catch (error) {
        
        next(error);
    }

}

export const removeWishList = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { productId } = req.body;
        const userId : string = req.user._id;

        const wishList : IWishList | null = await WishList.findOneAndUpdate({user : userId}, {
            $pull : { products : {
                product : productId
            }}
        });

        await wishList.save();

        res.status(200).json({error : 'Product removed from wishList'});

    } catch (error) {
        
        next(error);
    }

}

export const getWishList = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userId = req.user._id;

        const wishList : IWishListDocument = await WishList.findOne({user : userId}).populate({
            path : 'products',
            populate : {
                path : 'product',
                model : 'Product'
            }
        }).select('products');

        if(!wishList) return res.status(404).json([]);

        const mappedWishList = wishList.products.map(product => {

            return {
                _id : product.product._id,
                name: product.product.name,
                price: product.product.price,
                description : product.product.description
            };
        });

        res.status(200).json(mappedWishList);

    } catch (error) {
        
        next(error);
    }

}