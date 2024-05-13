import type { Request, Response, NextFunction } from 'express';
import { CatchAsyncError } from './catchAsyncError';
import ErrorHandler from '../utils/errorHandler';

export const checkReport = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userToModify = req.user;
        if(userToModify?.isBan) return res.status(403).json({error : 'This account has been banned please contact with admins'});

        // if(reports && reports.reportersId.length >= 12) {

        //     userToModify.isBan = true;
        //     await userToModify.save();

        //     res.status(403).json({error : 'This account has been banned please contact with admins'});
        // }

        next();

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});