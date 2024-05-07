import type { NextFunction, Request, Response } from 'express';
import Product from '../../models/shop/product.model';
import WishList from '../../models/shop/whishList.model';
import Cart from '../../models/shop/cart.model';
import Inventory from '../../models/shop/inventory.model';
import Comment from '../../models/shop/comment.model';
import type { ICommentDocument, IInventoryDocument, IPagination, IProduct } from '../../types';

export const productss = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { page, limit } = req.query;

        const NPage = Number(page);
        const NLimit = Number(limit);

        const startIndex = (NPage -1) * NLimit;
        const endIndex = NPage * NLimit;

        const result = <IPagination>{};

        if(endIndex < await Product.find().countDocuments().exec()) result.next = { page : NPage + 1, limit : NLimit }

        if(startIndex > 0) result.previous = { page : NPage - 1, limit : NLimit } 

        const products : IProduct[] | null = await Product.find().limit(NLimit).skip(startIndex);

        if(!products) return res.status(404).json({error : 'Product not found'});

        res.status(200).json(products);

    } catch (error) {
        
        next(error);
    }

}

export const deleteProduct = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: productId } = req.params;
        
        await Cart.updateMany({
            $pull : {products : {product : productId}}
        });

        await WishList.updateMany({
            $pull : {products : {product : productId}}
        });

        await Comment.deleteMany({
            productId
        });

        await Inventory.deleteOne({
            productId
        });

        await Product.findByIdAndDelete(productId);

        res.status(200).json({message : 'Product deleted', productId});

    } catch (error) {
        
        next(error);
    }

}

export const comments = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const comments : ICommentDocument[] | null = await Comment.find().populate('senderId');

        const comment = comments.map(comment => {

            return {
                _id : comment._id,
                text : comment.text,
                senderId : comment.senderId._id,
                productId : comment.productId,
                fullName : comment.senderId.fullName,
                profilePic : comment.senderId.profilePic,
                likes : comment.likes.length
            }
        });

        res.status(200).json(comment);   

    } catch (error) {
        
        next(error);
    }

}

export const inventory = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const inventory : IInventoryDocument[] | null = await Inventory.find().populate('productId');

        const mappedInventory = inventory.map(inventory => {

            return {
                productId : inventory.productId._id,
                name : inventory.productId.name,
                availableQuantity : inventory.availableQuantity
            }
        });

        res.status(200).json(mappedInventory);

    } catch (error) {
        
        next(error);
    }

}