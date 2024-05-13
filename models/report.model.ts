import { Schema, model } from 'mongoose';
import type { IReport } from '../types';

const ReportSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    reportersId : [{
        type : Schema.Types.ObjectId,
        ref : 'User',
        default : []
    }]

}, {timestamps : true});

const Report = model<IReport>('Report', ReportSchema);

export default Report;