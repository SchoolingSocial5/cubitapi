import { Request, Response, NextFunction } from 'express';
import Auction from '../models/Auction';
import Listing from '../models/Listing';
import Bid from '../models/Bid';

// @desc    Place a bid on a property
// @route   POST /api/v1/auctions/bid
// @access  Private
export const placeBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { propertyId, amount, source } = req.body;
        const userId = (req as any).user.id;

        if (source === 'listing' || source === 'auction') {
            const property = await Listing.findById(propertyId);
            if (!property) {
                return res.status(404).json({ success: false, error: 'Property not found' });
            }

            // Check if the user is the owner
            if (property.userId === userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Owners cannot bid on their own property'
                });
            }

            // 1. Record the individual bid
            const newBid = await Bid.create({
                propertyId,
                userId,
                username: (req as any).user.username,
                userEmail: (req as any).user.email,
                userPhone: (req as any).user.phone,
                amount
            });

            // 2. Find or Create/Update Auction record
            let auction = await Auction.findOne({ propertyId });

            if (!auction) {
                // If auction doesn't exist, create it (source was likely 'listing')
                auction = await Auction.create({
                    propertyId,
                    title: property.title,
                    type: property.type,
                    category: property.category,
                    subType: property.subType,
                    price: property.price,
                    currentBid: amount,
                    address: property.address,
                    city: property.city,
                    area: property.area,
                    state: property.state,
                    country: property.country,
                    landmark: property.landmark,
                    lat: property.lat,
                    lng: property.lng,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    areaSize: property.areaSize,
                    amenities: property.amenities,
                    images: property.images,
                    documents: property.documents,
                    numberOfBidders: 1,
                    latestBidTime: new Date(),
                    username: property.username,
                    userPicture: property.userPicture,
                    userEmail: property.userEmail,
                    userPhone: property.userPhone,
                    userId: property.userId,
                    slug: property.slug
                });

                // Update listing flag
                property.isAuctioned = true;
                await property.save();
            } else {
                // Update existing auction
                // Calculate unique bidders for this property
                const uniqueBidders = await Bid.distinct('userId', { propertyId });

                auction.currentBid = amount;
                auction.latestBidTime = new Date();
                auction.numberOfBidders = uniqueBidders.length;
                await auction.save();
            }

            return res.status(200).json({
                success: true,
                data: auction
            });
        }

        res.status(400).json({
            success: false,
            error: 'Invalid bid source'
        });
    } catch (error: any) {
        console.error('Place Bid Error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get all auctions
// @route   GET /api/v1/auctions
// @access  Public
export const getAuctions = async (req: Request, res: Response) => {
    try {
        const auctions = await Auction.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: auctions
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get single auction
// @route   GET /api/v1/auctions/:id
// @access  Public
export const getAuction = async (req: Request, res: Response) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) {
            return res.status(404).json({
                success: false,
                error: 'Auction not found'
            });
        }
        res.status(200).json({
            success: true,
            data: auction
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get bid history for a property
// @route   GET /api/v1/auctions/:propertyId/bids
// @access  Public
export const getBids = async (req: Request, res: Response) => {
    try {
        const bids = await Bid.find({ propertyId: req.params.propertyId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: bids.length,
            data: bids
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
