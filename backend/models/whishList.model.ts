import { Schema, model } from 'mongoose';
import type { IWishList } from '../types';

const WishListSchema = new Schema({
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
        }
    }]

}, {timestamps : true});

const WishList = model<IWishList>('WishList', WishListSchema);

export default WishList;