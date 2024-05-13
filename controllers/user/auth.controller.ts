import type { Request, Response, NextFunction } from 'express';
import User from '../../models/user.model';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import type { IActivationRequest, ILoginRequest, IRegisterBody, IUserModel } from '../../types';
import { validateLogin, validateRegister } from '../../validation/Joi';
import createActivationToken from '../../utils/activationToken';
import sendEmail from '../../utils/sendMail';
import jwt, { type Secret } from 'jsonwebtoken';
import { sendToken } from '../../utils/jwt';
import { redis } from '../../db/redis';

export const register = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { fullName, email, password } = req.body as IRegisterBody;

        const {error, value} = validateRegister(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const isEmailExists = await User.findOne({email}).select('+password');
        if(isEmailExists) return next(new ErrorHandler('Email already exists', 400));

        const user : IRegisterBody = {
            fullName, email, password,
        }

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;

        await sendEmail({email : user.email, subject : 'Activate your account', text : 'Please Past the blow code to active your account', html : `
        Activation Code is ${activationCode}
        `});

        res.status(201).json({success : true, message : 'Please check your email', activationToken : activationToken.token});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const verifyAccount = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { activationToken, activationCode } = req.body as IActivationRequest;

        const newUser : {user : IUserModel, activationCode : string} = jwt.verify(activationToken, process.env.ACTIVATION_TOKEN as Secret) as 
        {user : IUserModel, activationCode : string};

        if(newUser.activationCode !== activationCode) return next(new ErrorHandler('Invalid verify code', 400));

        const { fullName, email, password } = newUser.user;

        const existsUser = await User.findOne({email}).select('+password');
        if(existsUser) return next(new ErrorHandler('Email already exists', 400));

        const user = await User.create({
            fullName, email, password
        });

        res.status(200).json({message : 'Account has been created'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const login = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { email, password } = req.body as ILoginRequest;

        const { error, value } = validateLogin(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const user = await User.findOne({email}).select('+password');
        const isPasswordMatch = await user?.comparePassword(password);

        if(!user || !isPasswordMatch) return next(new ErrorHandler('Invalid email or password', 400));

        sendToken(user, 200, res);

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const logout = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        res.cookie('access_token', '', {maxAge : 1});
        res.cookie('refresh_token', '', {maxAge : 1});

        redis.del(req.user?._id);

        res.status(200).json({message : 'Logged out successfully'});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});