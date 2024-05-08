import type { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import Report from '../models/report.model';
import type { IReport, IUser } from '../types';

export const checkReport = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const userToModify = req.user;
        const reports : IReport | null = await Report.findOne({user : userToModify._id});

        if(userToModify.isBan) return res.status(403).json({error : 'This account has been banned please contact with admins'});

        if(reports && reports.reportersId.length >= 12) {

            userToModify.isBan = true;
            await userToModify.save();

            res.status(403).json({error : 'This account has been banned please contact with admins'});
        }

        next();

    } catch (error) {
        
        console.log(error);

        res.status(500).json({error : 'Internal server error'});
    }

}