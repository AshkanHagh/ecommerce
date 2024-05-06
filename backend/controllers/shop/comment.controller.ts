import type { Request, Response, NextFunction } from 'express';
import Comment from '../../models/shop/comment.model';
import type { IComment, ICommentDocument } from '../../types';

export const newComment = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { text } = req.body;
        const { id: productId } = req.params;
        const userId = req.user._id;

        const comment : IComment | null = new Comment({productId, text});

        comment.senderId = userId;

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

        const comment : IComment | null = await Comment.findById(commentId);

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

        const comment : IComment | null = await Comment.findById(commentId);

        if(comment.senderId.toString() !== currentUser.toString()) return res.status(400).json({error : 'Cannot delete others comment'});

        await comment.deleteOne();

        res.status(200).json({message : 'Comment has been deleted'});

    } catch (error) {
        
        next(error);
    }

}

export const likeComment = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: commentId } = req.params;
        const currentUser = req.user._id;

        const comment : IComment | null = await Comment.findById(commentId);

        const isLiked = comment.likes.includes(currentUser);

        if(isLiked) {

            comment.likes.splice(currentUser);
            await comment.save();

            res.status(200).json({message : 'Comment disLiked'});

        }else {

            comment.likes.push(currentUser);
            await comment.save();

            res.status(200).json({message : 'Comment liked'});
        }

    } catch (error) {
        
        next(error);
    }

}

export const getProductComments = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: productId } = req.params;
        
        const comments : ICommentDocument[] = await Comment.find({productId}).populate('senderId');

        const mapped = comments.map(comment => {

            const replay = comment.replies.map(replay => {

                return {
                    profilePic : replay.profilePic,
                    fullName : replay.fullName,
                    text : replay.text
                }
            });
            
            return {
                _id : comment._id,
                text : comment.text,
                profilePic : comment.senderId.profilePic,
                fullName : comment.senderId.fullName,
                replay
            }
        });

        res.status(200).json(mapped);

    } catch (error) {
        
        next(error);
    }

}