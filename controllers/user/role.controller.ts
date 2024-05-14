import type { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import type { IRoleModel, IRoleRequests } from '../../types';
import Role from '../../models/role';
import User from '../../models/user.model';
import { redis } from '../../db/redis';
import sendEmail from '../../utils/sendMail';

export const roleRequest = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { message, requestedRole } = req.body as IRoleModel;
        const userId = req.user;

        await Role.create({
            userId, message, requestedRole
        });

        res.status(200).json({success : true, message : `Your request to access role ${req.user?.role} has been successfully sent`});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const getRoleRequests = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const requests = await Role.find().populate('userId');

        const mappedRequests = requests.map((result : IRoleRequests) => {
            const { fullName, email, role } = result.userId;
            
            return {
                fullName, email, currentRole : role, message : result.message, requestedRole : result.requestedRole
            }
        });

        res.status(200).json(mappedRequests);

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const permissionToAdmin = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : userId } = req.params;

        const roleRequest = await Role.findOne({userId});
        if(!roleRequest) return next(new ErrorHandler('Role request not found', 400));

        const user = await User.findByIdAndUpdate(userId, {$set : {role : 'admin'}});
        await redis.set(user?._id, JSON.stringify(user), 'EX', 604800);

        await Role.findOneAndDelete({userId : user?._id});

        await sendEmail({email : user!.email, subject : 'Admin role request', text : 'Your access level has been upgraded to admin', html : `
            Your access level has been upgraded to admin <h4>${user!.email}</h4>
        `});

        res.status(200).json({success : true, message : `user role changed to admin successfully`});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

export const permissionToSeller = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : userId } = req.params;

        const roleRequest = await Role.findOne({userId});
        if(!roleRequest) return next(new ErrorHandler('Role request not found', 400));

        const user = await User.findByIdAndUpdate(userId, {$set : {role : 'seller'}});
        await redis.set(user?._id, JSON.stringify(user), 'EX', 604800);

        await sendEmail({email : user!.email, subject : 'Admin role request', text : 'Your access level has been upgraded to admin', html : `
        <h4>${user!.email}</h4>
        `});

        await Role.findOneAndDelete({userId : user?._id});

        res.status(200).json({success : true, message : `user role changed to seller successfully`});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const rejectRoleRequest = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : userId } = req.params;

        const result = await redis.get(userId);
        const user = JSON.parse(result!);

        const role = await Role.findOneAndDelete({userId : userId});
        if(!role) return next(new ErrorHandler('Role request not found', 400));

        await sendEmail({email : user!.email, subject : 'Admin role request rejected', text : 'Your request for role has been rejected', html : `
            Your access level has been rejected
        `});

        res.status(200).json({success : true, message : 'Role request rejected'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});