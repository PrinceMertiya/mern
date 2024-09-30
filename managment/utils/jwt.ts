require("dotenv").config();
import { Response } from "express";
import { redis } from "./redis";
import { IUser } from "../model/user.model";
import { LargeNumberLike } from "crypto";





interface ITokenOptions {
    expires: Date;
    maxAge : number;
    httpOnly: boolean;
    samSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

export const sendToken = (user:IUser, statusCode: number, res:Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // upload session to redis



    //parse environment variable s to integrates with fallback value
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

    //option for cookies
    const accessTokenOptions: ITokenOptions ={
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire,
        httpOnly: true,
        samSite: 'lax',
        
    };
    
    const refreshTokenOptions: ITokenOptions ={
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire,
        httpOnly: true,
        samSite: 'lax',


        
    };
    //only set secure to true in production

    if (process.env.NODE_ENV === 'production'){
        accessTokenOptions.secure = true;
    }

    res.cookie("access_token",accessToken,accessTokenOptions);
    res.cookie("refresh_token",refreshToken,refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    })






}