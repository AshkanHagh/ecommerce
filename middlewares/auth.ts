import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from './catchAsyncError';
import ErrorHandler from '../utils/errorHandler';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { redis } from '../db/redis';

export const isAuthenticated = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const accessToken = req.cookies.access_token;
        if(!accessToken) return next(new ErrorHandler('Please login to access this recourse', 400));

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as Secret) as JwtPayload;
        if(!decoded) return next(new ErrorHandler('Access token is not valid', 400));

        const user = await redis.get(decoded.id);
        if(!user) return next(new ErrorHandler('User not found', 400));

        req.user = JSON.parse(user);

        next();

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const authorizeRoles = (...role : string[]) => {
    return (req : Request, res : Response, next : NextFunction) => {
        if(!role.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role : ${req.user?.role} is not allowed to access this recourse`, 400));
        }
        next();
    }
}