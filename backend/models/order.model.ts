import { Schema, model } from 'mongoose';
import type { IOrder } from '../types';

const OrderSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    products : [{
        product : {
            type : Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        quantity : {
            type : Number,
            required : true
        }
    }],
    totalPrice : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ['pending', 'processing', 'shipped', 'delivered'],
        required : true
    },
    address : {
        type : Schema.Types.ObjectId,
        ref : 'Address',
        required : true
    }

}, {timestamps : true});

const Order = model<IOrder>('Order', OrderSchema);

export default Order;