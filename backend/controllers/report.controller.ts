import type { Request, Response } from 'express';
import Report from '../models/report.model';
import type { IReport } from '../types';

export const newReport = async (req : Request, res : Response) => {

    try {
        const { id: userToModify } = req.params;
        const currentUser = req.user._id;

        let report : IReport | null = await Report.findOne({user : userToModify});

        if(report.user.toString() === currentUser.toString()) return res.status(400).json({error : 'Cannot report yourself'});

        if(!report) {
            
            report = await Report.create({user : userToModify});
            report.reportersId.push(currentUser);
        }

        const isReported = report.reportersId.includes(currentUser);

        if(!isReported) {

            await Report.findOneAndUpdate({user : userToModify}, {
                $push : {reportersId : currentUser}
            });
        }

        await report.save();

        res.status(200).json({message : 'User has been reported'});

    } catch (error) {
        
        console.log('error in newReport controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}