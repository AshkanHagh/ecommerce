import type { request } from 'express';
import type { Document, Date, ObjectId } from 'mongoose';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user : JwtPayload
            images : any
        }
    }
}

export interface IUser extends Document {
    fullName : string
    email : string
    password : string
    profilePic? : string
    isAdmin? : boolean
    isSeller? : boolean
    isBan? : boolean
    token? : string
    tokenExpireDate? : unknown
}

export interface IProduct extends Document {
    name : string
    price : number
    description : string
    images? : string[]
    category : string[]
    color : string[]
    size? : string[]
    user : ObjectId
    availableProductQuantity : Number
}

export interface IOrder extends Document {
    user : ObjectId
    products : ObjectId[]
    totalPrice? : number
    status : string
    address : ObjectId
}

export interface IOrderDocument extends IOrder {
    products : {
        name : string
        price : number
        description : string
        images : string
    }[]
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
            _id? : ObjectId
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

export interface IWishListDocument extends IWishList {
    products : {
        product : {
            name : string,
            price : number,
            description : string
        }
    }[]
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

export interface IPagination {
    next : {
        page : number
        limit : number
    }
    previous : {
        page : number
        limit : number
    }
    result : object
}

export interface IInventory extends Document {
    productId : ObjectId
    availableQuantity : number
}

export interface IReport extends Document {
    user : ObjectId
    reportersId : ObjectId[]
}

export interface IComment extends Document {
    productId : ObjectId
    senderId : ObjectId
    text : string
    replies? : {
        userId : ObjectId
        text : string
        fullName : string
        profilePic : string
    }[]
    likes? : ObjectId[]
}

export interface ICommentDocument extends IComment {
    replies? : {
        profilePic : string
        fullName : string
        text : string
    }[]
    text : string
    senderId : {
        _id? : ObjectId
        fullName : string
        profilePic : string
    }
}

export interface IInventoryDocument extends IInventory {
    productId? : {
        _id : ObjectId
        name : string
    }
}