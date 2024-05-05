import type { Request, Response, NextFunction } from 'express';
import Comment from '../models/comment.model';
import type { IComment } from '../types';

export const newComment = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { text } = req.body;
        const { id: productId } = req.params;
        const userId = req.user._id;

        const comment = new Comment({productId, text});

        comment.senderId.push(userId);

        await comment.save();

        res.status(200).json({userId, fullName : req.user.fullName, profilePic : req.user.profilePic, text});

    } catch (error) {
        
        next(error);
    }

}

export const replay = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { text } = req.body; 
        const { id: commentId } = req.params;
        const { _id, fullName, profilePic } = req.user;

        const comment : IComment | null = await Comment.findOne({_id : commentId});

        comment.replies.push({
            userId : _id,
            text,
            fullName,
            profilePic
        });

        await comment.save();

        res.status(200).json({userId : _id, fullName, profilePic, text});

    } catch (error) {
        
        next(error);
    }

}

export const editComment = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { text } = req.body;
        const { id: commentId } = req.params;
        const currentUser = req.user._id;

        const comment = await Comment.findById(commentId);

        if(comment.senderId.toString() !== currentUser.toString()) return res.status(400).json({error : 'Cannot edit others comment'});

        comment.text = text;

        await comment.save();

        res.status(200).json({message : 'Comment edited', text});
 
    } catch (error) {
        
        next(error);
    }

}

export const deleteComment = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: commentId } = req.params;
        const currentUser = req.user._id;

        const comment = await Comment.findById(commentId);

        if(comment.senderId.toString() !== currentUser.toString()) return res.status(400).json({error : 'Cannot delete others comment'});

        await comment.deleteOne();

        res.status(200).json({message : 'Comment has been deleted'});

    } catch (error) {
        
        next(error);
    }

}