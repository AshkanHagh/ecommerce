import type { Request, Response } from 'express';
import User from '../models/user.model';
import type { IPagination, IUser } from '../types';

export const allUsers = async (req : Request, res : Response) => {

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
        
        console.log('error in allUsers controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}