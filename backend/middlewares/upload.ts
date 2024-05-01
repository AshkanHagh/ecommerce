import cloudinary from '../utils/cloudinary';
import type { NextFunction, Request, Response } from 'express';

export const uploadFile = async (req : Request, res : Response, next : NextFunction) => {

    const images : any = req.files;
    const imageUrls = [];

    for (const image of images) {
        const result = await cloudinary.uploader.upload(image.path, {
            resource_type : 'auto'
        });

        imageUrls.push(result.secure_url);
    }

    req.images = imageUrls;

    next();

}