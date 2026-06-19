import { Request, Response, NextFunction } from 'express';
import Bookmark from '../models/Bookmark';
import Listing from '../models/Listing';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/asyncHandler';

// @desc    Toggle a bookmark on a property
// @route   POST /api/v1/bookmarks/:propertyId
// @access  Private
export const toggleBookmark = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(propertyId);
    if (!listing) {
        return next(new ErrorResponse(`Listing not found with id of ${propertyId}`, 404));
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({ userId, propertyId });

    if (existingBookmark) {
        // Remove bookmark
        await existingBookmark.deleteOne();
        listing.bookmarks = Math.max(0, listing.bookmarks - 1);
        await listing.save();

        res.status(200).json({
            success: true,
            message: 'Bookmark removed',
            data: { isBookmarked: false, bookmarks: listing.bookmarks }
        });
    } else {
        // Add bookmark
        await Bookmark.create({ userId, propertyId });
        listing.bookmarks += 1;
        await listing.save();

        res.status(201).json({
            success: true,
            message: 'Bookmark added',
            data: { isBookmarked: true, bookmarks: listing.bookmarks }
        });
    }
});

// @desc    Get user's bookmarked properties
// @route   GET /api/v1/bookmarks
// @access  Private
export const getMyBookmarks = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const bookmarks = await Bookmark.find({ userId: req.user.id })
        .populate('propertyId')
        .sort({ createdAt: -1 });

    // Format response to look like listings but with isBookmarked = true
    const bookmarkedListings = bookmarks
        .filter(b => b.propertyId !== null) // Ignore dangling bookmarks
        .map((b: any) => {
            const listingObj = b.propertyId.toObject();
            listingObj.isBookmarked = true;
            return listingObj;
        });

    res.status(200).json({
        success: true,
        count: bookmarkedListings.length,
        data: bookmarkedListings
    });
});
