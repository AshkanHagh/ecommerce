import type { request } from 'express';
import type { Document, Date, ObjectId } from 'mongoose';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user : JwtPayload
        }
    }
}

export interface IUser extends Document {
    fullName : string
    email : string
    password : string
    profilePic : string
    isAdmin : boolean
    isSeller : boolean
    token : string
    tokenExpireDate : unknown
}

export interface IProduct extends Document {
    name : string
    price : number
    description : string
    images : string[]
    category : string[]
    color : string[]
    size : string[]
    user : ObjectId
}

export interface IOrder extends Document {
    user : ObjectId
    products : {
        product : ObjectId
        quantity : number
    }[],
    totalPrice : number
    status : string
    address : ObjectId
}

export interface ICart extends Document {
    user : ObjectId
    products : {
        product : ObjectId
        quantity : number
    }[],
}

export interface ICartDocument extends ICart {
    products : {
        product : {
            name : string,
            price : number,
            description : string
        },
        quantity : number
    }[]
}

export interface IWishList extends Document {
    user : ObjectId
    products : {
        product : ObjectId
    }[],
}

export interface IAddress extends Document {
    user : ObjectId
    addressLine1 : string
    addressLine2 : string
    city : string
    state : string
    country : string
    postalCode : string
}