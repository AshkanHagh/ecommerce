import { Document, type ObjectId } from 'mongoose';

// User Schema interface
export interface IUser extends Document {
    fullName : string,
    email : string,
    password : string,
}

// Product Schema Interface
export interface IProduct extends Document {
    name : string,
    price : number,
    description : string,
    images : string[],
    category : string[],
    color : string[],
    size : string[],
}

export interface IOrder extends Document {
    user : ObjectId,
    products : {
        product : ObjectId,
        quantity : number
    }[],
    totalPrice : number,
    status : string,
    address : ObjectId
}

export interface ICart extends Document {
    user : ObjectId,
    products : {
        product : ObjectId,
        quantity : number
    }[],
}

export interface IWishList extends Document {
    user : ObjectId,
    products : {
        product : ObjectId
    }[],
}

export interface IAddress extends Document {
    user : ObjectId,
    addressLine1 : string,
    addressLine2 : string,
    city : string,
    state : string,
    country : string,
    postalCode : string,
}