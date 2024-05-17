import { Model, Schema, model } from 'mongoose';
import type { ICommentModel } from '../../types';

const CommentSchema = new Schema<ICommentModel>({
    productId : {
        type : Schema.Types.ObjectId, ref : 'Product', required : [true, 'ProductId must provided'],
    },
    senderId : {
        type : Schema.Types.ObjectId, ref : 'User', required : [true, 'SenderId must provided']
    },
    text : {
        type : String, maxLength : 255, required : [true, 'Text must provided']
    },
    replies : [{
        userId : {
            type : Schema.Types.ObjectId, ref : 'User'
        },
        replayText : String
    }],
    likes : [{
        userId : {
            type : Schema.Types.ObjectId, ref : 'User'
        },
    }]

}, {timestamps : true});

const Comment : Model<ICommentModel> = model('Comment', CommentSchema);

export default Comment;