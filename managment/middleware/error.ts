import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {

    // Set default error status code and message
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong MongoDB ID error (CastError)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Duplicate key error (Mongoose unique field error)
    if (err.code === 11000) {
        const message = `Duplicate field value: ${Object.keys(err.keyValue)} entered.`;
        err = new ErrorHandler(message, 400);
    }

    // JWT error: Invalid token
    if (err.name === 'JsonWebTokenError') {
        const message = `Invalid JSON Web Token. Please try again.`;
        err = new ErrorHandler(message, 400);
    }

    // JWT error: Token expired
    if (err.name === 'TokenExpiredError') {
        const message = `Your JSON Web Token has expired. Please try again.`;
        err = new ErrorHandler(message, 400);
    }

    // Send error response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        // Optionally include stack trace for development environments:
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
