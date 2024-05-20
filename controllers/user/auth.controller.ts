import type { Request, Response, NextFunction } from 'express';
import User from '../../models/user.model';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import type { IActivationRequest, ILoginRequest, IRegisterBody, IUserModel } from '../../types';
import { validateLogin, validateRegister } from '../../validation/Joi';
import createActivationToken from '../../utils/activationToken';
import sendEmail from '../../utils/sendMail';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { accessTokenOption, refreshTokenOption, sendToken } from '../../utils/jwt';
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

        await sendEmail({
            email: user.email,
            subject: 'Activate Your Account',
            text: 'Please use the following code to activate your account: ' + activationCode,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Activate Your Account</h2>
                <p>Please use the following code to activate your account:</p>
                <div style="border: 1px solid #ddd; padding: 10px; font-size: 20px; margin-top: 20px; text-align: center;">
                  <strong>${activationCode}</strong>
                </div>
                <p>If you did not request this code, please ignore this email or contact our support team.</p>
                <p>Best regards,<br>The Support Team</p>
              </div>
            `
          });

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
        
        if(user?.isBan) return next(new ErrorHandler('This account has been banned please contact with admins', 400));

        sendToken(user, 200, res);

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const logout = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        res.cookie('access_token', '', {maxAge : 1});
        res.cookie('refresh_token', '', {maxAge : 1});

        redis.del(`user:${req.user?._id}`);

        res.status(200).json({message : 'Logged out successfully'});
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const refreshToken = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;

        const message = 'Could not refresh token';

        if(!decoded) return next(new ErrorHandler(message, 400));

        const session = await redis.get(`user:${decoded.id}` as string);
        if(!session) return next(new ErrorHandler('Please login for access this resources', 400));

        const user = JSON.parse(session);
        req.user = user;

        const accessToken = jwt.sign({id : user._id}, process.env.ACCESS_TOKEN as string, {expiresIn : '5m'});
        const refreshToken = jwt.sign({id : user._id}, process.env.REFRESH_TOKEN as string, {expiresIn : '3d'});

        res.cookie('access_token', accessToken, accessTokenOption);
        res.cookie('refresh_token', refreshToken, refreshTokenOption);

        redis.set(`user:${user._id}`, JSON.stringify(user), 'EX', 604800); // 7 day

        res.status(200).json({accessToken});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});