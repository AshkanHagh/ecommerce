import { Model, Schema, model } from 'mongoose';
import type { IReportModel } from '../types';

const ReportSchema = new Schema<IReportModel>({
    user : {
        type : Schema.Types.ObjectId, ref : 'User', required : true
    },
    reportersId : [{
        type : Schema.Types.ObjectId, ref : 'User', default : []
    }]

}, {timestamps : true});

const Report : Model<IReportModel> = model('Report', ReportSchema);

export default Report;