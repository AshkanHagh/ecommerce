import type { Response } from 'express';
import type { ITokenOptions, IUserModel } from '../types';
import { redis } from '../db/redis';

const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

export const accessTokenOption : ITokenOptions = {
    expires : new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge : accessTokenExpire * 60 * 60 * 1000,
    httpOnly : true,
    sameSite : 'lax'
}

export const refreshTokenOption : ITokenOptions = {
    expires : new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge : refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly : true,
    sameSite : 'lax'
}

export const sendToken = (user : IUserModel, statusCode : number, res : Response) => {

    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    const {password, ...others} = user._doc;

    redis.set(`user:${user._id}`, JSON.stringify(others) as string, 'EX', 604800);

    if(process.env.NODE_ENV === 'production') {
        accessTokenOption.secure = true
    }

    res.cookie('access_token', accessToken, accessTokenOption);
    res.cookie('refresh_token', refreshToken, refreshTokenOption);

    res.status(statusCode).json({others, accessToken});
}