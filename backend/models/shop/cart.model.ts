import { Schema, model } from 'mongoose';
import type { ICart } from '../../types';

const CartSchema = new Schema({
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
            default : 1
        },
        default : []
    }]

}, {timestamps : true});

const Cart = model<ICart>('Cart', CartSchema);

export default Cart;