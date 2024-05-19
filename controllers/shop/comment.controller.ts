import { type Request, type Response, type NextFunction, text } from 'express';
import { CatchAsyncError } from '../../middlewares/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import type { ICommentBody, ICommentMap, ICommentModel, IUserModel } from '../../types';
import Comment from '../../models/shop/comment.model';
import { redis } from '../../db/redis';
import { validateComment } from '../../validation/Joi';

export const createComment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { text } = req.body as ICommentBody;
        const { id : productId } = req.params;
        const senderId = req.user?._id;

        const {error, value} = validateComment(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const comment = await Comment.create({productId, senderId, text});
        res.status(200).json({success : true, comment});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const comments = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : productId } = req.params;

        const cache = await redis.get(`comments:${productId}`);
        if(cache) {
            const comments = JSON.parse(cache);
            return res.status(200).json({success : true, comments});
        }

        const comments = await Comment.find({productId}).sort({createdAt : -1}).populate({
            path : 'replies', populate : {path : 'userId', model : 'User'}
        }).populate('senderId');
        if(!comments) return next(new ErrorHandler('No comment found. your comment can be first one', 400));

        const comment = comments.map((comments : ICommentModel) => {
            const { fullName, email, role } = comments.senderId as IUserModel;

            const mappedData = comments.replies?.map((comment : ICommentMap) => {
                const { fullName, email, role } = comment.userId;
    
                return {
                    _id : comment._id, fullName, email, role, text : comment.replayText
                }
            });
    
            const result = {_id : comments._id, productId : comments.productId, senderId : {fullName, email, role},
            text : comments.text, likes : comments.likes, replay : mappedData}

            return result
        })
            
        await redis.set(`comments:${productId}`, JSON.stringify(comment), 'EX', 86400);

        res.status(200).json({success : true, comment : comment});
            
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const replay = CatchAsyncError(async (req : Request, res : Response,  next : NextFunction) => {

    try {
        const { id : commentId } = req.params;
        const { text } = req.body as ICommentBody;
        const userId = req.user?._id;

        const {error, value} = validateComment(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const comment = await Comment.findByIdAndUpdate(commentId, {$push : {replies : {userId, replayText : text}}}, {new : true});

        await redis.set(`comments:${comment?.productId}`, JSON.stringify(comment), 'EX', 86400);

        res.status(200).json({success : true, comment});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const likeComment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : commentId } = req.params;
        const userId = req.user?._id;

        const comment = await Comment.findById(commentId);

        const isLiked = comment?.likes?.findIndex(user => user.userId.toString() === userId);

        if(isLiked !== -1) {
            comment?.likes?.splice(isLiked!, 1);

            await comment?.save();
            await redis.set(`comments:${comment?.productId}`, JSON.stringify(comment), 'EX', 86400);

            res.status(200).json({success : true, message : 'Comment disLiked successfully'});
        }else {
            comment?.likes?.push({userId : userId});

            await comment?.save();
            await redis.set(`comments:${comment?.productId}`, JSON.stringify(comment), 'EX', 86400);

            res.status(200).json({success : true, message : 'Comment liked successfully'});
        }
        
    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const editCommentText = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { text } = req.body as ICommentBody;
        const { id : commentId } = req.params;
        const userId = req.user?._id;

        const {error, value} = validateComment(req.body);
        if(error) return next(new ErrorHandler(error.message, 400));

        const comment = await Comment.findOneAndUpdate({_id : commentId, senderId : userId}, {$set : {text}}, {new : true});
        await redis.set(`comments:${comment?.productId}`, JSON.stringify(comment), 'EX', 86400);

        res.status(200).json({success : true, comment});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const deleteComment = CatchAsyncError(async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id : commentId } = req.params;
        const userId = req.user?._id;

        const comment = await Comment.findOneAndDelete({_id : commentId, senderId : userId});
        await redis.del(`comments:${comment?.productId}`);

        res.status(200).json({success : true, message : 'Comment has been deleted'});

    } catch (error : any) {
        return next(new ErrorHandler(error.message, 400));
    }
});