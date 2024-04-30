import type { Request, Response } from 'express';
import Cart from '../models/cart.model';
import type { ICart, ICartDocument, IProduct } from '../types';

export const addToCart = async (req : Request, res : Response) => {

    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        let cart : ICart | null = await Cart.findOne({user : userId});

        if(!cart) {
            cart = await Cart.create({
                user : userId,
                products : []
            });
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
        
        console.log('error in addToCart controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const removeCart = async (req : Request, res : Response) => {

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
        
        console.log('error in removeCart controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const getCart = async (req : Request, res : Response) => {

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
                name: product.product.name,
                price: product.product.price,
                description : product.product.description,
                quantity: product.quantity
            };
        });        

        res.status(200).json(mappedCart);

    } catch (error) {
        
        console.log('error in getCart controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}