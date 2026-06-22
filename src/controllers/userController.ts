import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { uploadToS3 } from '../utils/s3';
import paginate from '../utils/paginate';

// @desc    Register user
// @route   POST /api/v1/users
// @access  Public
export const createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    // Create user
    try {
        const user = await User.create({
            username,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err: any) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const message = field === 'username'
                ? 'Username is already taken'
                : field === 'email'
                    ? 'Email is already registered'
                    : `${field} already exists`;

            return next(new ErrorResponse(message, 400));
        }
        next(err);
    }
});

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Verify user / Update profile
// @route   PUT /api/v1/users/verify
// @access  Private
export const verifyUser = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let idCardUrl = req.body.idCard;
    let passportUrl = req.body.passport;

    // Check if idCard is a base64 string and upload to S3
    if (req.body.idCard && req.body.idCard.startsWith('data:')) {
        try {
            const base64Data = req.body.idCard.split(',')[1];
            const mimeType = req.body.idCard.split(';')[0].split(':')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${req.user.username}-id-card.${mimeType.split('/')[1]}`;

            idCardUrl = await uploadToS3(buffer, fileName, mimeType);
        } catch (err: any) {
            return next(new ErrorResponse(`Failed to process/upload ID image: ${err.message}`, 500));
        }
    }

    // Check if passport is a base64 string and upload to S3
    if (req.body.passport && req.body.passport.startsWith('data:')) {
        try {
            const base64Data = req.body.passport.split(',')[1];
            const mimeType = req.body.passport.split(';')[0].split(':')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${req.user.username}-passport.${mimeType.split('/')[1]}`;

            passportUrl = await uploadToS3(buffer, fileName, mimeType);
        } catch (err: any) {
            return next(new ErrorResponse(`Failed to process/upload Face Passport image: ${err.message}`, 500));
        }
    }

    const fieldsToUpdate = {
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        sex: req.body.sex,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        address: req.body.address,
        area: req.body.area,
        state: req.body.state,
        country: req.body.country,
        idCard: idCardUrl,
        passport: passportUrl,
        idName: req.body.idName,
        nextOfKinName: req.body.nextOfKinName,
        nextOfKinRelation: req.body.nextOfKinRelation,
        nextOfKinPhone: req.body.nextOfKinPhone,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Get current logged in user
// @route   GET /api/v1/users/me
// @access  Private
export const getMe = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin-Staff
export const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const results = await paginate(User, req);
    res.status(200).json(results);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin-Staff
export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user verification status
// @route   PUT /api/v1/users/:id/verify
// @access  Private/Admin-Staff
export const updateUserStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user profile (Settings)
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let pictureUrl = req.body.picture;

    if (req.body.picture && req.body.picture.startsWith('data:')) {
        try {
            const base64Data = req.body.picture.split(',')[1];
            const mimeType = req.body.picture.split(';')[0].split(':')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${req.user.username}-profile.${mimeType.split('/')[1]}`;

            pictureUrl = await uploadToS3(buffer, fileName, mimeType);
        } catch (err: any) {
            return next(new ErrorResponse(`Failed to process/upload profile picture: ${err.message}`, 500));
        }
    }

    const fieldsToUpdate: any = {
        email: req.body.email,
        phone: req.body.phone,
    };
    if (req.body.accountType) fieldsToUpdate.accountType = req.body.accountType;
    if (req.body.bio !== undefined) fieldsToUpdate.bio = req.body.bio;
    if (req.body.website !== undefined) fieldsToUpdate.website = req.body.website;

    if (pictureUrl) fieldsToUpdate.picture = pictureUrl;

    try {
        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err: any) {
        if (err.code === 11000) {
            return next(new ErrorResponse('Email is already registered to another account', 400));
        }
        next(err);
    }
});

// @desc    Update user password
// @route   PUT /api/v1/users/password
// @access  Private
export const updatePassword = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ErrorResponse('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return next(new ErrorResponse('Incorrect current password', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        data: 'Password updated successfully'
    });
});
// @desc    Delete user account
// @route   DELETE /api/v1/users/account
// @access  Private
export const deleteAccount = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { password } = req.body;

    if (!password) {
        return next(new ErrorResponse('Please provide password to authorize deletion', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Incorrect password', 401));
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
        success: true,
        data: 'Account deleted successfully'
    });
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ),
        httpOnly: true
    };

    res
        .status(statusCode)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                picture: user.picture,
                role: user.role,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                sex: user.sex,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
                area: user.area,
                state: user.state,
                country: user.country,
                idCard: user.idCard,
                idName: user.idName,
                passport: user.passport,
                isVerified: user.isVerified,
                nextOfKinName: user.nextOfKinName,
                nextOfKinRelation: user.nextOfKinRelation,
                nextOfKinPhone: user.nextOfKinPhone,
            }
        });
};
