import { Schema, model } from 'mongoose';
import type { IComment } from '../types';

const CommentSchema = new Schema({
    productId : {
        type : Schema.Types.ObjectId,
        ref : 'Product',
        required : true,
    },
    senderId : [{
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }],
    text : {
        type : String,
        maxLength : 255,
        required : true
    },
    replies : [
        {
            userId : {
                type : Schema.Types.ObjectId,
                ref : 'User',
                required : true
            },
            text : {
                type : String,
                required : true,
                maxlength : 255
            },
            fullName : {
                type : String,
                required : true
            },
            profilePic : {
                type : String,
                default : ''
            }
        }
    ],
    likes : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }]

}, {timestamps : true});

const Comment = model<IComment>('Comment', CommentSchema);

export default Comment;