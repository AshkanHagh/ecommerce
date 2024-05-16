import { Model, Schema, model } from 'mongoose';
import type { IOrderModel } from '../../types';

const OrderSchema = new Schema<IOrderModel>({
    user: {
        type: Schema.Types.ObjectId, ref: 'User', required: true
    },
    products: [{
        type: Schema.Types.ObjectId, ref: 'Product', required: true
    }],
    quantity : Number,
    totalPrice: Number,
    status: {
        type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], required: true
    },
    address: {
        type: Schema.Types.ObjectId, ref: 'Address', required: true
    },
    paymentRefId : Number

}, { timestamps: true });

const Order : Model<IOrderModel> = model('Order', OrderSchema);

export default Order;