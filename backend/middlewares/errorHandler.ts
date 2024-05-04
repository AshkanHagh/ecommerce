import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { isHttpError } from 'http-errors';

const errorHandler : ErrorRequestHandler = (error, req : Request, res : Response, next : NextFunction) => {

    console.log(error);
    let statusCode = 500;
    let errorMessage = 'An unknown error occurred';

    if(isHttpError(error)) {
        statusCode = error.statusCode;
        error.message = error.message;
    }
    
    res.status(statusCode).json({error : errorMessage});
    next();
}

export default errorHandler;