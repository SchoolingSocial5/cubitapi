import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('--- ERROR HANDLER HIT ---');
    console.error('Error Object:', err);

    let error = { ...err };

    error.message = err.message;

    // Log to console for dev
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
        console.error('CastError handled:', message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
        console.error('Duplicate key error handled:', message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
        error = new ErrorResponse(message, 400);
        console.error('Validation error handled:', message);
    }

    // Handle specific case for "Not authorized" from protect middleware if user not found
    // This assumes the protect middleware throws an ErrorResponse with a specific message or status
    if (error.message === 'User not found' && error.statusCode === 404) {
        console.error('User not found in protect middleware, returning 401:', error.message);
        error = new ErrorResponse('Not authorized to access this route', 401);
    } else if (error.message === 'Not authorized to access this route' && error.statusCode === 401) {
        console.error('Authorization error from protect middleware:', error.message);
    }


    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

export default errorHandler;
