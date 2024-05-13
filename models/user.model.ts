import { Schema, model } from 'mongoose';
import type { IUserModel } from '../types';
import bcrypt from 'bcrypt';
import jwt, { type Secret } from 'jsonwebtoken';

const UserSchema = new Schema<IUserModel>({
    fullName : {
        type : String, required : [true, 'FullName field must be provided']
    },
    email : {
        type : String, required : [true, 'Email field must be provided'], unique : true
    },
    password : {
        type : String, required : [true, 'Password field must be provided'], minlength : 6, select : false
    },
    profilePic : {
        public_id : String,
        url : String
    },
    role : {
        type : String, enum : ['admin', 'seller', 'user'], default : 'user'
    },
    birthDay : Date,
    isBan : {
        type : Boolean, default : false
    }

}, {timestamps : true});

UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.SignAccessToken = function() {
    return jwt.sign({id : this._id}, process.env.ACCESS_TOKEN as Secret, {expiresIn : '5m'});
}

UserSchema.methods.SignRefreshToken = function () {
    return jwt.sign({id : this._id}, process.env.REFRESH_TOKEN as Secret, {expiresIn : '3d'});
}

UserSchema.methods.comparePassword = async function (enteredPassword : string) : Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = model<IUserModel>('User', UserSchema);

export default User;