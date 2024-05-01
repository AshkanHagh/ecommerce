import { Schema, model } from 'mongoose';
import type { IOrder } from '../types';

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    totalPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        required: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    }
}, { timestamps: true });

const Order = model<IOrder>('Order', OrderSchema);

export default Order;