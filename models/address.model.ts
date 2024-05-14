import { Schema, model } from 'mongoose';
import type { IAddressModel } from '../types';

const AddressSchema = new Schema<IAddressModel>({
    user : {
        type : Schema.Types.ObjectId, ref : 'User', required : true
    },
    addressLine1 : {
        type : String, required : true
    },
    addressLine2 : {
        type : String,
    },
    city : {
        type : String, required : true
    },
    state : {
        type : String, required : true
    },
    country : {
        type : String, required : true
    },
    postalCode : {
        type : String, required : true
    },

}, {timestamps : true});

const Address = model<IAddressModel>('Address', AddressSchema);

export default Address;