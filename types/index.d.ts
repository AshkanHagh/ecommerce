import type { request, Response } from 'express';
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

export interface IReportModel extends Document {
    user : IUserModel['_id']
    reportersId : IUserModel['_id'][]
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

export interface ICartModel extends Document {
    user : IUserModel['_id']
    products : {
        product : IProductModel['_id']
        quantity : number
    }[],
}

export interface IOrderModel extends Document {
    user : IUserModel['_id']
    products : IProductModel['_id']
    quantity : number
    totalPrice? : number
    status : 'pending' | 'processing' | 'shipped' | 'delivered'
    address : IAddressModel['_id']
    paymentRefId : number
}

export interface ICommentModel extends Document {
    productId : IProductModel['_id']
    senderId : IUserModel['_id']
    text : string
    replies? : {
        userId : IUserModel['_id'],
        replayText : string
    }[]
    likes? : {
        userId : IUserModel['_id']
    }[]
}

export interface ILogModel extends Document {
    admin : IUserModel['_id']
    modify : string
    text : string
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

export interface ICartBody {
    quantity : number
}

export interface ICartMap {
    product : {
        name : string
        price : number
        images : string[]
    }
    quantity : number       
}

export interface IPaymentQuery {
    Authority : string
    Status : string
}

export interface IOrderMap {
    _id : IOrderModel['_id']
    name : string
    price : number
    totalPrice : number
    status : string
}

export interface IOrderStatusBody {
    status : 'pending' | 'processing' | 'shipped' | 'delivered'
}

export interface ICommentBody {
    text : string
}

export interface ICommentMap {
    _id? : ObjectId
    userId : {
        fullName : string
        email : string
        role : string
    }
    replayText? : string
}

// export interface ILogMap extends Document {
//     admin : {
//         _id : IUserModel['_id']
//         email : IUserModel['email']
//     }
//     userToModify? : {
//         _id : IUserModel['_id']
//         email : IUserModel['email']
//     }
//     productToModify? : {
//         _id : IProductModel['_id']
//         name : IProductModel['name']
//     }
//     text : string
// }

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