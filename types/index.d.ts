import type { request } from 'express';
import type { Document, ObjectId } from 'mongoose';
import type { JwtPayload } from 'jsonwebtoken';

export type IError = {
    statusCode : Number
    message : string
}

export interface IUserModel extends Document {
    fullName : string
    email : string
    password : string
    profilePic? : {
        public_id : string
        url : string
    }
    role : 'admin' | 'seller' | 'user' | string;
    birthDay? : Date
    isBan? : boolean
    comparePassword : (password : string) => Promise<boolean>
    SignAccessToken : () => string
    SignRefreshToken : () => string
    _doc : any
}

export interface IAddressModel extends Document {
    user? : ObjectId
    addressLine1 : string
    addressLine2 : string
    city : string
    state : string
    country : string
    postalCode : string
}

export interface IRoleModel extends Document {
    userId : IUserModel
    message : string
    requestedRole : 'seller' | 'admin' | string
}

export interface IProductModel extends Document {
    name : string
    price : number
    description : string
    images : {
        public_id : string,
        url : string
    }[]
    category : string[]| undefined
    color : string[]| undefined
    size : string[]| undefined
    user : IUserModel['_id']
}

export interface IInventoryModel extends Document {
    productId : IProductModel['_id']
    availableQuantity : number
}

export interface IWishListModel extends Document {
    user : IUserModel['_id']
    products : {
        product : IProductModel['_id']
    }[],
}

declare global {
    namespace Express {
        interface Request {
            user? : IUserModel
        }
    }
}

export interface IRegisterBody {
    fullName : string
    email : string
    password : string
}

export interface ILoginRequest {
    email : string
    password : string
}

export interface IUpdateInfoBody {
    fullName : string
    email : string
    birthDay? : Date
}

export interface IUpdatePasswordBody {
    oldPassword : string
    newPassword : string
}

export interface IUpdateProfilePic {
    profilePic : string
}

export interface IRoleRequests {
    userId : {
        fullName : string
        email : string
        role : string
    }
    message : string
    requestedRole : string
}

export interface IActivationToken {
    token : string
    activationCode : string
}

export interface IActivationRequest {
    activationToken : string
    activationCode : string
}

export interface ITokenOptions {
    expires : Date
    maxAge : number
    httpOnly : boolean
    sameSite : 'lax' | 'strict' | 'none' | undefined
    secure? : boolean
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
    products? : {
        product : {
            _id? : ObjectId
            name : string,
            price : number,
            description : string
        },
        quantity : number
    }[]
}

export interface IWishListDocument extends IWishList {
    products : {
        product : {
            _id : ObjectId
            name : string,
            price : number,
            description : string
        }
    }[]
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

export interface IReportModel extends Document {
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