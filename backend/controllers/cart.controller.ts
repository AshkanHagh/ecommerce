import type { Request, Response } from 'express';
import Cart from '../models/cart.model';
import WishList from '../models/whishList.model';
import Order from '../models/order.model';
import Inventory from '../models/inventory.model';
import type { ICart, ICartDocument, IInventory, IOrder, IOrderDocument } from '../types';

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

        const { cartId, addressId } = req.body;
        const userId = req.user._id

        const cart : ICartDocument | null = await Cart.findById(cartId).populate('products.product');

        if(!cart) return res.status(404).json({error : 'Cart not found'});

        let totalPrice = 0;

        for (const item of cart.products) {
            totalPrice += item.product.price * item.quantity;

            const inventory = await Inventory.findOne({productId : item.product._id});
            if(!inventory) return res.status(404).json({error : 'Inventory not found'});

            if(inventory.availableQuantity === 0 || inventory.availableQuantity < item.quantity) 
                return res.status(400).json({error : 'Not enough available products'});
        }

        const order = new Order({
            user: userId,
            products: cart.products.map((item: any) => item.product),
            totalPrice,
            status: 'pending',
            address: addressId
        });

        await order.save();

        await Cart.findByIdAndUpdate(cartId, {
            $pull : {products : {product : order.products}}
        });

        for (const item of cart.products) {

            const inventory : IInventory | null = await Inventory.findOne({productId : item.product._id});
            inventory.availableQuantity -= item.quantity;

            await inventory.save();
        }

        res.status(200).json({message: 'Order placed successfully'});
        
    } catch (error) {
        
        console.log('error in newOrder controller :', error);

        res.status(500).json({error : 'Internal server error'});
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

        console.log('error in orderDetail controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const updateOrder = async (req : Request, res : Response) => {

    try {
        const { id: orderId } = req.params;
        const { status } = req.body;

        const order : IOrder | null = await Order.findById(orderId);

        if(!order) return res.status(404).json({error : 'Order not found'});

        order.status = status;

        await order.save();

        res.status(200).json({message : 'Order Updated', status : order.status});

    } catch (error) {
        
        console.log('error in updateOrder controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}