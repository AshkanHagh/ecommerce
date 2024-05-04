import type { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';

export const confirmPermission = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const user = await User.findById(req.user._id);

        if(user.isSeller || user.isAdmin) {
            next();
        }else {
            res.status(403).json({error : 'Access dined'});
        }

    } catch (error) {
        
        console.log(error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const adminPermission = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const user = await User.findById(req.user._id);

        if(user.isAdmin) {
            next();
        }else {
            res.status(403).json({error : 'Access dined'});
        }

    } catch (error) {
        
        console.log(error);

        res.status(500).json({error : 'Internal server error'});
    }

}