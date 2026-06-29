import { Request, Response, NextFunction } from 'express';
import Listing, { IListing } from '../models/Listing';
import Auction from '../models/Auction';
import Bookmark from '../models/Bookmark';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { uploadToS3, deleteFromS3 } from '../utils/s3';
import paginate from '../utils/paginate';

// @desc    Get all listings
// @route   GET /api/v1/listings
// @access  Public
export const getListings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const results = await paginate(Listing, req);

    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
            userId = decoded.id;
        } catch (err) {
            // Ignore invalid tokens on public routes
        }
    }

    if (userId && results.data && results.data.length > 0) {
        const listingIds = results.data.map((listing: any) => listing._id);
        const userBookmarks = await Bookmark.find({ 
            userId, 
            propertyId: { $in: listingIds } 
        });
        
        const bookmarkedSet = new Set(userBookmarks.map(b => b.propertyId.toString()));
        
        results.data = results.data.map((listing: any) => {
            const listingObj = typeof listing.toObject === 'function' ? listing.toObject() : { ...listing };
            listingObj.isBookmarked = bookmarkedSet.has(listingObj._id.toString());
            return listingObj;
        });
    }

    res.status(200).json(results);
});

// @desc    Get single listing
// @route   GET /api/v1/listings/:id
// @access  Public
export const getListing = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return next(new ErrorResponse(`Listing not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: listing
    });
});

// @desc    Get single listing by slug
// @route   GET /api/v1/listings/slug/:slug
// @access  Public
export const getListingBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const listing = await Listing.findOne({ slug: req.params.slug });

    if (!listing) {
        return next(new ErrorResponse(`Listing not found with slug of ${req.params.slug}`, 404));
    }

    res.status(200).json({
        success: true,
        data: listing
    });
});

export const createListing = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    // Add user info to body
    req.body.userId = req.user.id;
    req.body.username = req.user.username;
    req.body.userEmail = req.user.email;
    req.body.userPhone = req.user.phone;
    req.body.userPicture = req.user.picture;

    // Process images
    if (req.body.images && Array.isArray(req.body.images)) {
        const processedImages = [];
        for (const image of req.body.images) {
            if (image.startsWith('data:')) {
                try {
                    const base64Data = image.split(',')[1];
                    const mimeType = image.split(';')[0].split(':')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    // Create unique filename
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = mimeType.split('/')[1];
                    const fileName = `listings/${req.user.username}-${uniqueSuffix}.${ext}`;

                    const url = await uploadToS3(buffer, fileName, mimeType);
                    processedImages.push(url);
                } catch (err: any) {
                    return next(new ErrorResponse(`Failed to upload image: ${err.message}`, 500));
                }
            } else {
                // Assume it's already a URL if not base64
                processedImages.push(image);
            }
        }
        req.body.images = processedImages;
    }

    // Process documents
    if (req.body.documents && Array.isArray(req.body.documents)) {
        const processedDocs = [];
        for (const doc of req.body.documents) {
            // Check if it's a new upload (base64)
            if (doc.file && doc.file.startsWith('data:')) {
                try {
                    const base64Data = doc.file.split(',')[1];
                    const mimeType = doc.file.split(';')[0].split(':')[1];

                    // Validate mime-type
                    const allowedTypes = [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ];

                    if (!allowedTypes.includes(mimeType)) {
                        return next(new ErrorResponse(`Document ${doc.name} has an invalid format. Only PDF and Word documents are allowed.`, 400));
                    }

                    const buffer = Buffer.from(base64Data, 'base64');
                    // Create unique filename
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = mimeType.split('/')[1];
                    const fileName = `documents/${req.user.username}-${uniqueSuffix}.${ext}`;

                    const url = await uploadToS3(buffer, fileName, mimeType);
                    processedDocs.push({
                        name: doc.name,
                        url: url
                    });
                } catch (err: any) {
                    return next(new ErrorResponse(`Failed to upload document: ${err.message}`, 500));
                }
            } else if (doc.url) {
                // Already has a URL
                processedDocs.push(doc);
            }
        }
        req.body.documents = processedDocs;
    }

    const listing = await Listing.create(req.body);

    res.status(201).json({
        success: true,
        data: listing
    });
});

// @desc    Get user's current draft listing
// @route   GET /api/v1/listings/my-draft
// @access  Private
export const getMyDraft = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const { type } = req.query;
    
    const query: any = {
        userId: req.user.id,
        isPublished: false
    };
    
    if (type) {
        query.type = type;
    }

    const draft = await Listing.findOne(query).sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        data: draft || null
    });
});

// @desc    Get current user's listings
// @route   GET /api/v1/listings/my-listings
// @access  Private
export const getMyListings = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const listings = await Listing.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: listings.length,
        data: listings
    });
});

export const updateListing = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    try {
        let listing = await Listing.findById(req.params.id);

        if (!listing) {
            return next(new ErrorResponse(`Listing not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is listing owner
        if (listing.userId !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this listing`, 401));
        }

        // Remove fields that should not be updated manually
        delete req.body.userId;
        delete req.body.username;
        delete req.body.userEmail;
        delete req.body.userPhone;
        delete req.body.userPicture;
        delete req.body.createdAt;
        delete req.body.updatedAt;
        delete req.body._id;

        console.log(`UpdateListing: User ${req.user.username} is updating listing ${req.params.id}`);

        // Process new images if provided
        if (req.body.images && Array.isArray(req.body.images)) {
            console.log(`UpdateListing: Processing ${req.body.images.length} images...`);
            const processedImages = [];
            for (const image of req.body.images) {
                if (typeof image === 'string' && image.startsWith('data:')) {
                    try {
                        const base64Data = image.split(',')[1];
                        const mimeType = image.split(';')[0].split(':')[1];
                        const buffer = Buffer.from(base64Data, 'base64');
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        const ext = mimeType.split('/')[1];
                        const fileName = `listings/${req.user.username}-${uniqueSuffix}.${ext}`;

                        const url = await uploadToS3(buffer, fileName, mimeType);
                        processedImages.push(url);
                    } catch (err: any) {
                        return next(new ErrorResponse(`Failed to upload image: ${err.message}`, 500));
                    }
                } else {
                    processedImages.push(image);
                }
            }
            req.body.images = processedImages;
        }

        // Process documents if provided
        if (req.body.documents && Array.isArray(req.body.documents)) {
            console.log(`Processing ${req.body.documents.length} documents...`);
            const processedDocs = [];
            for (const doc of req.body.documents) {
                if (doc.file && typeof doc.file === 'string' && doc.file.startsWith('data:')) {
                    try {
                        const base64Data = doc.file.split(',')[1];
                        const mimeType = doc.file.split(';')[0].split(':')[1];

                        // Validate mime-type
                        const allowedTypes = [
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        ];

                        if (!allowedTypes.includes(mimeType)) {
                            return next(new ErrorResponse(`Document ${doc.name} has an invalid format. Only PDF and Word documents are allowed.`, 400));
                        }

                        const buffer = Buffer.from(base64Data, 'base64');
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        const ext = mimeType.split('/')[1];
                        const fileName = `documents/${req.user.username}-${uniqueSuffix}.${ext}`;

                        const url = await uploadToS3(buffer, fileName, mimeType);
                        processedDocs.push({
                            name: doc.name,
                            url: url
                        });
                    } catch (err: any) {
                        return next(new ErrorResponse(`Failed to upload document: ${err.message}`, 500));
                    }
                } else if (doc.url) {
                    processedDocs.push(doc);
                }
            }
            req.body.documents = processedDocs;
        }

        console.log('Updating listing in database...');
        listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: listing
        });
    } catch (err: any) {
        console.error('Update Listing Crash:', err);
        return next(new ErrorResponse(`An unexpected error occurred during update: ${err.message}`, 500));
    }
});

// @desc    Delete listing
// @route   DELETE /api/v1/listings/:id
// @access  Private
export const deleteListing = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return next(new ErrorResponse(`Listing not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is listing owner
    if (listing.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this listing`, 401));
    }

    // Capture files to delete before removing listing
    const filesToDelete: string[] = [];
    if (listing.images && listing.images.length > 0) {
        filesToDelete.push(...listing.images);
    }
    if (listing.documents && listing.documents.length > 0) {
        listing.documents.forEach(doc => {
            if (doc.url) filesToDelete.push(doc.url);
        });
    }

    // Delete files from S3 asynchronously
    if (filesToDelete.length > 0) {
        console.log(`S3 Cleanup: Deleting ${filesToDelete.length} files associated with listing ${listing._id}`);
        filesToDelete.forEach(url => deleteFromS3(url));
    }

    // Delete associated auction if exists
    await Auction.findOneAndDelete({ propertyId: listing._id });

    await listing.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
