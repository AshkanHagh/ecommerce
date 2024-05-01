import type { Request, Response } from 'express';
import Cart from '../models/cart.model';
import WishList from '../models/whishList.model';
import Address from '../models/address.model';
import Order from '../models/order.model';
import type { ICart, ICartDocument, IOrderDocument } from '../types';

export const addToCart = async (req : Request, res : Response) => {

    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        let cart : ICart | null = await Cart.findOne({user : userId});

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
                cartId : cart._id,
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

export const newOrder = async (req : Request, res : Response) => {

    try {
        const { products: cartId, addressId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findById(cartId).populate('products.product');

        if(!cart) return res.status(404).json({ error: 'Cart not found' });

        const address = await Address.findById(addressId);

        if (!address) return res.status(404).json({ error: 'Address not found' });

        let totalPrice = 0;
        cart.products.forEach((item: any) => {
            totalPrice += item.product.price * item.quantity;
        });

        const order = new Order({
            user: userId,
            products: cart.products.map((item: any) => item.product),
            totalPrice,
            status: 'pending',
            address: addressId
        });

        await order.save();

        const updatedCart = await Cart.findByIdAndUpdate(cartId, {
            $pull : {products : {product : order.products}}
        });

        res.status(201).json({ message: 'Order created successfully'});

    } catch (error) {
        
        console.error('Error creating order:', error);

        res.status(500).json({ error: 'Internal server error' });
    }

}

export const orderDetail = async (req : Request, res : Response) => {

    try {
        const orderId = req.params.id;

        const order : IOrderDocument = await Order.findById(orderId).populate('products address').select('products totalPrice status address');

        if(!order) return res.status(404).json({ error: 'Order not found' });

        const mappedOrder = order.products.map(product => {

            return {
                name : product.name,
                price : product.price,
                description : product.description,
                images : product.images,
                totalPrice : order.totalPrice,
                status : order.status,
                address : order.address
            }
        })

        res.status(200).json(mappedOrder);

    } catch (error) {

        console.error('Error fetching order:', error);

        res.status(500).json({ error: 'Internal server error' });
    }

}