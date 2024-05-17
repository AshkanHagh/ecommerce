import type { Request, Response, NextFunction } from 'express';
import type { IAddressModel, IUpdateInfoBody, IUpdatePasswordBody, IUpdateProfilePic, IUserModel } from '../../types';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { validateAccountInfo, validateAccountPassword, validateAddress, validateProfile } from '../../validation/Joi';
import User from '../../models/user.model';
import { redis } from '../../db/redis';
import Address from '../../models/address.model';
import {v2 as cloudinary} from 'cloudinary'; 

export const accountInfo = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const user = req.user;
        res.status(200).json({success : true, user});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const updateAccountInfo = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { fullName, email, birthDay } = req.body as IUpdateInfoBody;
        const userId = req.user?._id;

        const {error, value} = validateAccountInfo(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const user = await User.findById(userId);
        const isEmailExists = await User.findOne({email});

        if(isEmailExists) return next(new ErrorHandler('Email already exists', 400));

        user!.fullName = fullName || user!.fullName;
        user!.email = email || user!.email;
        user!.birthDay = birthDay || user!.birthDay;
        await user!.save();

        redis.set(`user:${user?._id}`, JSON.stringify(user), 'EX', 604800);

        res.status(200).json({success : true, user});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const updateAccountPassword = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { oldPassword, newPassword } = req.body as IUpdatePasswordBody;
        const user = await User.findById(req.user?._id).select('+password');
        
        const {error, value} = validateAccountPassword(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if(!isPasswordMatch) return next(new ErrorHandler('Invalid old password', 400));

        user!.password = newPassword;
        await user?.save();

        res.status(200).json({success : true, message : 'Password has been changed'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const address = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { addressLine1, addressLine2, city, state, country, postalCode } = req.body as IAddressModel;
        const userId = req.user?._id;

        const {error, value} = validateAddress(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        let address = await Address.findOne({user : userId});
        if(!address) {

            address = await Address.create({
                addressLine1, addressLine2, city, state, country, postalCode, user : userId
            });

            await address.save();

            return res.status(201).json({success : true, address});
        }

        address.addressLine1 = addressLine1 || address.addressLine1;
        address.addressLine2 = addressLine2 || address.addressLine2;
        address.city = city || address.city; address.state = state || address.state;
        address.country = country || address.country; address.postalCode = postalCode || address.postalCode;

        await address.save();

        res.status(200).json({success : true, address});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const addressInfo = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userId = req.user?._id;

        const address = await Address.findOne({user : userId});
        if(!address) return next(new ErrorHandler('No address found. please set new address', 400));

        res.status(200).json({success : true, address});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const updateAccountProfilePic = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { profilePic } = req.body as IUpdateProfilePic;

        const {error, value} = validateProfile(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const user = await User.findById(req.user?._id);
        if(!profilePic && user) user.profilePic = user.profilePic;

        if(user?.profilePic?.public_id) {
            
            await cloudinary.uploader.destroy(user?.profilePic.public_id);

            const myCloud = await cloudinary.uploader.upload(profilePic, {
                folder : 'profilePic', width : 150
            });
            user!.profilePic = {
                public_id : myCloud.public_id, url : myCloud.url
            }
        }

        const myCloud = await cloudinary.uploader.upload(profilePic, {
            folder : 'profilePic', width : 150
        });
        user!.profilePic = {
            public_id : myCloud.public_id, url : myCloud.url
        }

        await user?.save();
        redis.set(`user:${user?._id}`, JSON.stringify(user), 'EX', 604800);

        res.status(201).json({success : true, profilePic : user?.profilePic});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
}); 