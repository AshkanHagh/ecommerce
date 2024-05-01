import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import Address from '../models/address.model';
import type { IAddress, IUser } from '../types';

export const userProfile = async (req : Request, res : Response) => {

    try {
        const userId : string = req.user._id;

        const currentUser : IUser | null = await User.findById(userId).select(
            '-password -isAdmin -isSeller -updatedAt -token -tokenExpireDate -__v'
        );

        if(!currentUser) return res.status(400).json({error : 'User not found'});

        res.status(200).json(currentUser);

    } catch (error) {
        
        console.log('error in getProfile controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const updateProfile = async (req : Request, res : Response) => {

    try {
        const { fullName, email, password } = req.body;
        let { profilePic } = req.body;
        const userId : string = req.user._id;
        const { id } = req.params;

        const currentUser : IUser | null = await User.findById(userId);

        if(!currentUser || id !== userId.toString()) return res.status(401).json({error : 'Access denied - Unauthorized'});

        if(password) {

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            currentUser.password = hashedPassword;
        }

        currentUser.fullName = fullName || currentUser.fullName;
        currentUser.email = email || currentUser.email;

        await currentUser.save();

        currentUser.password = null;
        currentUser.token = null;
        currentUser.tokenExpireDate = null

        res.status(200).json(currentUser);

    } catch (error) {
        
        console.log('error in updateProfile controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}

export const updateAddress = async (req : Request, res : Response) => {

    try {
        const { addressLine1, addressLine2, city, state, country, postalCode } = req.body;
        const userId : string = req.user._id;
        const { id } = req.params;

        if(id !== userId.toString()) return res.status(401).json({error : 'Access denied - Unauthorized'});

        let address : IAddress | null = await Address.findOne({user : userId});

        if(!address) {

            address = new Address({
                user : userId,
                addressLine1,
                addressLine2,
                city, state, country, postalCode
            });

            await address.save();
        }

        address.addressLine1 = addressLine1 || address.addressLine1;
        address.addressLine2 = addressLine2 || address.addressLine2;
        address.city = city || address.city;
        address.state = state || address.state;
        address.country = country || address.country;
        address.postalCode = postalCode || address.postalCode;

        await address.save();

        res.status(200).json(address);

    } catch (error) {
        
        console.log('error in updateAddress controller :', error);

        res.status(500).json({error : 'Internal server error'});
    }

}