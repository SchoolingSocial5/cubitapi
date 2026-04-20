import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from './asyncHandler';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';

interface DecodedToken {
    id: string;
}

export const protect = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            console.error('User not found in protect middleware for ID:', decoded.id);
            return next(new ErrorResponse('User not found. Please log in again.', 401));
        }

        next();
    } catch (err: any) {
        console.error('Protect Middleware Error:', err);
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
