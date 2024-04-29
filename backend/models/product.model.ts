import { Schema, model } from 'mongoose';
import type { IProduct } from '../types';

const ProductSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    images : [{
        type : String,
        required : true
    }],
    category : [{
        type : String,
        required : true
    }],
    color : [{ 
        type : String 
    }],
    size : [{ 
        type : String 
    }],
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

}, {timestamps : true});

const Product = model<IProduct>('Product', ProductSchema);

export default Product;