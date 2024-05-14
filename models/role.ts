import { Schema, Model, model } from 'mongoose';
import type { IRoleModel } from '../types';

const RoleSchema = new Schema<IRoleModel>({
    userId : {
        type : Schema.Types.ObjectId, ref : 'User', required : true
    },
    message : String,
    requestedRole : {
        type : String, enum : ['seller', 'admin'], required : true
    }

}, {timestamps : true});

const Role : Model<IRoleModel> = model('Role', RoleSchema);

export default Role;