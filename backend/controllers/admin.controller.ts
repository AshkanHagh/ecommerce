import type { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import Product from '../models/shop/product.model';
import WishList from '../models/shop/whishList.model';
import Cart from '../models/shop/cart.model';
import Order from '../models/shop/order.model';
import Inventory from '../models/shop/inventory.model';
import Report from '../models/report.model';
import Address from '../models/shop/address.model';
import type { ICart, IPagination, IProduct, IReport, IUser, IWishList } from '../types';

export const allUsers = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { page, limit } = req.query;

        const NPage = Number(page);
        const NLimit = Number(limit);

        const startIndex = (NPage -1) * NLimit;
        const endIndex = NPage * NLimit;

        const result = <IPagination>{};

        if(endIndex < await User.find().countDocuments().exec()) result.next = { page : NPage + 1, limit : NLimit }

        if(startIndex > 0) result.previous = { page : NPage - 1, limit : NLimit } 

        const users : IUser[] | null = await User.find({isAdmin : false}).limit(NLimit).skip(startIndex)
        .select('-password -isAdmin -token -tokenExpireDate -createdAt -UpdatedAt -__v -profilePic');

        if(!users) return res.status(404).json({error : 'Users not found'});

        res.status(200).json(users);

    } catch (error) {
        
        next(error);
    }

}

export const deleteSingleUser = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: userToModify } = req.params;

        const user : IUser | null = await User.findById(userToModify);

        if(user.isSeller) {

            const products : IProduct[] | null = await Product.find({user : userToModify});
            
            for (const product of products) {
                
                await WishList.updateMany<IWishList>({
                    $pull : {products : {product : product._id}}
                });
                
                await Cart.updateMany<ICart>({
                    $pull : {products : {product : product._id}}
                });

                await Inventory.deleteMany({
                    productId : product._id
                });
            }

            await Report.updateMany<IReport>({
                $pull : {reportersId : userToModify}
            });
            
            await Promise.all([Product.deleteMany({user : userToModify}), WishList.deleteMany({user : userToModify}),
                Cart.deleteMany({user : userToModify}), Order.deleteMany({user : userToModify}), Report.deleteMany({user : userToModify}),
                Address.deleteMany({user : userToModify}), User.deleteOne({_id : userToModify})
            ]);
        }

        await Promise.all([WishList.deleteMany({user : userToModify}), Cart.deleteMany({user : userToModify}), 
            Report.deleteMany({user : userToModify}), Address.deleteMany({user : userToModify}), User.deleteOne({_id : userToModify})
        ]);

        res.status(200).json({message : 'User has been deleted'});

    } catch (error) {

        next(error);
    }

}

export const banUser = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: userToModify } = req.params;

        await User.findByIdAndUpdate(userToModify, {
            isBan : true
        });

        res.status(200).json({message : 'User has been baned'});

    } catch (error) {
        
        next(error);
    }

}