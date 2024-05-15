import { Model, Schema, model } from 'mongoose';
import type { IWishListModel } from '../../types';

const WishListSchema = new Schema<IWishListModel>({
    user : {
        type : Schema.Types.ObjectId, ref : 'User', required : true
    },
    products : [{
        product : {
            type : Schema.Types.ObjectId, ref : 'Product', required : true
        }
    }]

}, {timestamps : true});

const WishList : Model<IWishListModel> = model('WishList', WishListSchema);

export default WishList;