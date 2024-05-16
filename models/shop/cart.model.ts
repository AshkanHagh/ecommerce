import { Model, Schema, model } from 'mongoose';
import type { ICartModel } from '../../types';

const CartSchema = new Schema<ICartModel>({
    user : {
        type : Schema.Types.ObjectId, ref : 'User', required : true
    },
    products : [{
        product : {
            type : Schema.Types.ObjectId, ref : 'Product', required : true
        },
        quantity : {
            type : Number, default : 1
        }
    }]

}, {timestamps : true});

const Cart : Model<ICartModel> = model('Cart', CartSchema);

export default Cart;