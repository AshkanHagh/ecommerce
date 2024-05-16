import type { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Cart from '../../models/shop/cart.model';
import Order from '../../models/shop/order.model';
import Inventory from '../../models/shop/inventory.model';
import ZarinpalCheckout from 'zarinpal-checkout';
import Address from '../../models/address.model';
import type { IOrderMap, IOrderStatusBody } from '../../types';
import { redis } from '../../db/redis';

let zarinpal = ZarinpalCheckout.create(process.env.MERCHANT_ID as string, true);

export const getPayment =CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {

        const {_id : userId, email} = req.user!;

        const cart = await Cart.findOne({user : userId}).populate({path : 'products', populate : {path : 'product', model : 'Product'}});
        if(cart!.products.length < 1 || !cart) return next(new ErrorHandler('Cart is empty', 400));

        let totalPrice = 0;
        for(const product of cart.products) {
            totalPrice += product.product.price * product.quantity;
        }

        const payment = await zarinpal.PaymentRequest({
            Amount : totalPrice,
            CallbackURL : 'http://localhost:7319/api/v1/product/order/payment/verify',
            Description : 'Thank you for trusting the website, the product will be sent immediately upon payment',
            Email : email,
            Mobile : '',
        });

        // res.redirect(payment.url);
        res.status(200).json(payment);

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const verifyPayment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { Authority, Status } = req.query as any;
        const userId = req.user?._id;

        const cart = await Cart.findOne({user : userId}).populate({path : 'products', populate : {path : 'product', model : 'Product'}});
        if(cart!.products.length < 1 || !cart) return next(new ErrorHandler('Cart is empty', 400));

        let totalPrice = 0;
        let quantity = 0;
        for(const product of cart.products) {
            
            totalPrice += product.product.price * product.quantity;
            quantity += product.quantity;
            
            const inventory = await Inventory.findOne({productId : product.product});
            
            if(!inventory) return next(new ErrorHandler('Inventory not foudn', 400));
            if(inventory?.availableQuantity == 0 || inventory.availableQuantity < product.quantity)
                return next(new ErrorHandler('not enough available products', 400));
        }

        if(Status == 'NOK') return res.status(200).json({error : 'Payment failed!'});
        const payment = await zarinpal.PaymentVerification({
            Amount : totalPrice,
            Authority
        });

        if(payment.status !== 100) return res.status(200).json({error : 'Payment failed!'});

        const address = await Address.findOne({user : userId});
        if(!address) return next(new ErrorHandler('Address not found. please add a address', 400));

        const order = await Order.create({
            user : userId, products: cart.products.map(item => item.product), totalPrice, status : 'pending', address : address._id,
            paymentRefId : payment.RefID, quantity
        });

        await order.save();

        await Cart.findOneAndUpdate({user : userId}, {$pull : {products : {product : order.products}}});
        await redis.del(`cart:${userId}`);

        for (const item of cart.products) {
            const inventory = await Inventory.findOne({productId : item.product._id});
            inventory!.availableQuantity -= item.quantity;
    
            await inventory!.save();
         }

        res.status(200).redirect(`http://localhost:7319/api/v1/product/order/payment/detail/${payment.RefID}`);

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const orderDetail = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : refId } = req.params;
        
        const order = await Order.findOne({paymentRefId : refId}).populate('products');

        const mappedData = order!.products.map((product : IOrderMap) => {
            return {
                name : product.name, price : product.price, status : order?.status,
                
            }
        });

        res.status(200).json({success : true, detail : {_id : order?._id, totalPrice : order?.totalPrice, 
            quantity : order?.quantity, order : mappedData}});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const updateOrderStatus = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : orderId } = req.params;
        const { status } = req.body as IOrderStatusBody;
        
        const order = await Order.findByIdAndUpdate(orderId, {$set : {status}});
        res.status(200).json({success : true, order});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});