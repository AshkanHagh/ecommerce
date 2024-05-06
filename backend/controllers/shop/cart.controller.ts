import type { NextFunction, Request, Response } from 'express';
import Cart from '../../models/shop/cart.model';
import WishList from '../../models/shop/whishList.model';
import Order from '../../models/shop/order.model';
import Inventory from '../../models/shop/inventory.model';
import type { ICart, ICartDocument, IInventory, IOrder, IOrderDocument } from '../../types';

export const addToCart = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        let cart : ICart | null = await Cart.findOne({user : userId});

        const inventory : IInventory | null = await Inventory.findOne({productId});

        if(inventory.availableQuantity <= quantity) return res.status(200).json({error : 'Not enough products available'});

        await WishList.findOneAndUpdate({user : userId}, {
            $pull : {products : {product : productId}}
        });

        if(!cart) {
            cart = await Cart.create({user : userId});
        }

        const existingProduct = cart.products.findIndex(item => item.product.toString() === productId);

        if(existingProduct !== -1) {

            cart.products[existingProduct].quantity+=quantity
        }else {
            cart.products.push({product : productId, quantity});
        }

        await cart.save();

        res.status(200).json({message : 'Product added to cart'});

    } catch (error) {
        
        next(error);
    }

}

export const removeCart = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { productId } = req.body;
        const userId = req.user._id;

        const cart : ICart | null = await Cart.findOne({user : userId});

        if(!cart) return res.status(404).json({error : 'Product not found'});

        const productIndex = cart.products.findIndex(item => item.product.toString() === productId);

        if(productIndex !== -1) {

            if(cart.products[productIndex].quantity > 1) {

                cart.products[productIndex].quantity -= 1;

            }else {
                cart.products.splice(productIndex, 1);
            }
        }

        await cart.save();

        res.status(200).json({message : 'Product removed from cart'});

    } catch (error) {
        
        next(error);
    }

}

export const getCart = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userId = req.user._id;

        const cart : ICartDocument = await Cart.findOne({user : userId}).populate({
            path : 'products',
            populate : {
                path : 'product',
                model : 'Product'
            }
        }).select('products');        

        const mappedCart = cart.products.map(product => {

            return {
                cartId : cart._id,
                name: product.product.name,
                price: product.product.price,
                description : product.product.description,
                quantity: product.quantity
            };
        });        

        res.status(200).json(mappedCart);

    } catch (error) {
        
        next(error);
    }

}