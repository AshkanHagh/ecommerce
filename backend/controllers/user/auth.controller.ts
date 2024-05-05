import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import generateTokenAndSetCookie from '../../utils/generateToken';
import User from '../../models/user.model';
import type { IUser } from '../../types';

export const signup = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { fullName, email, password, confirmPassword } = req.body;

        const existingEmail : IUser | null = await User.findOne({email});

        if(existingEmail) return res.status(400).json({error : 'User already exists'});

        if(password !== confirmPassword) return res.status(400).json({error : 'Password dose not match'});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user : IUser | null = new User({
            fullName,
            email,
            password : hashedPassword
        });

        if(user) {
            generateTokenAndSetCookie(user._id, res);
            await user.save();

            res.status(201).json({_id : user._id, fullName : user.fullName, email : user.email});

        }else {
            res.status(400).json({error : 'Invalid data'});
        }
        
    } catch (error) {
        
        next(error);
    }

}

export const login = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { email, password } = req.body;

        const user : IUser | null = await User.findOne({email});
        const isPasswordMatch = await bcrypt.compare(password, user?.password || '');

        if(!user || !isPasswordMatch) return res.status(400).json({error : 'Invalid email or password'});

        generateTokenAndSetCookie(user._id, res);

        // sendEmail({subject : 'Login', text : 'Login was successfully, welcome...', email : user.email});

        res.status(200).json({_id : user._id, fullName : user.fullName, email : user.email});

    } catch (error) {
        
        next(error);
    }

}

export const logout = async (req : Request, res : Response, next : NextFunction) => {

    try {
        res.cookie('jwt', '', {maxAge : 1});

        res.status(200).json({message : 'Logged out successfully'});

    } catch (error) {
        
        next(error);
    }

}