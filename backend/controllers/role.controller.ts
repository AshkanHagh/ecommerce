import type { Request, Response } from 'express';
import type { IUser } from '../types';
import User from '../models/user.model';
import crypto from 'crypto';
import sendEmail from '../utils/email';

export const confirmEmail = async (req : Request, res : Response) => {

    try {
        const { email } = req.body;

        const currentUser : IUser | null = await User.findOne({email}).select('-password');
        if(!currentUser) return res.status(404).json({error : 'User not found'});
        
        const token = crypto.randomBytes(32).toString('hex');
        // const token = req.cookies.jwt;

        currentUser.token = token;
        currentUser.tokenExpireDate = Date.now() + 3600000;

        await currentUser.save();

        sendEmail({email : currentUser.email.toString(), subject : 'Confirm Email', text : 'please confirm your email', html : `
            <p>Confirm Your Email</p>
            <p>Click <a href="http://localhost:5000/api/role/admin/${token}">here</a></p>
        `});

        res.status(200).json({message : 'Email sended please check your email'});

    } catch (error) {
        
        console.log('error in confirmEmail controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const permissionToAdmin = async (req : Request, res : Response) => {

    try {
        const { token } = req.params;

        const user = await User.findOne({token, tokenExpireDate : {
            $gt : Date.now()
        }});

        if(!user) return res.status(401).json({error : 'Token is not valid'});

        user.isAdmin = true

        await user.save();

        res.status(200).json({message : 'Role changed to admin'});

    } catch (error) {
        
        console.log('error in permissionToAdmin controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const permissionToSeller = async (req : Request, res : Response) => {

    try {
        const { token } = req.params;

        const user = await User.findOne({token, tokenExpireDate : {
            $gt : Date.now()
        }});
        
        if(!user) return res.status(401).json({error : 'Token is not valid'});

        user.isSeller = true;

        await user.save()

        res.status(200).json({message : 'Role changed to seller'});

    } catch (error) {
        
        console.log('error in permissionToSeller controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}