import { Model, Schema, model } from 'mongoose';
import type { IProductModel } from '../../types';

const ProductSchema = new Schema<IProductModel>({
    name : {
        type : String, required : [true, 'Product name must provided']
    },
    price : {
        type : Number, required : [true, 'Product price must provided']
    },
    description : {
        type : String, required : [true, 'Product description must provided']
    },
    images : [
        {
            public_id : String,
            url : String
        }
    ],
    category : [{
        type : String, enum : ['Electronics', 'Books', 'Toys-and-games', 'Sport', 'Apparels', 'Food'], 
        required : [true, 'Product category must provided']
    }],
    color : [{ type : String }],
    size : [{ type : String }],
    user : {
        type : Schema.Types.ObjectId, ref : 'User', required : [true, 'Product user account must provided']
    }

}, {timestamps : true});

const Product : Model<IProductModel> = model('Product', ProductSchema);

export default Product;