import mongoose, { Schema, Document } from 'mongoose';

export interface IAuction extends Document {
    propertyId: mongoose.Types.ObjectId;
    userId: string;
    title: string;
    type: string;
    category: string;
    subType?: string;
    price: number;
    currentBid: number;

    // Location (from Listing)
    address: string;
    city?: string;
    area: string;
    state: string;
    country: string;
    landmark?: string;
    lat?: number;
    lng?: number;

    // Features (from Listing)
    bedrooms?: number;
    bathrooms?: number;
    areaSize?: number;
    amenities: string[];

    // Media (from Listing)
    images: string[];
    documents: { name: string, url: string }[];

    // Bidding Stats
    latestBidTime?: Date;
    numberOfBidders: number;

    // User Info
    username?: string;
    userPicture?: string;
    userEmail?: string;
    userPhone?: string;
    slug: string;
}

const auctionSchema: Schema = new Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subType: String,
    price: {
        type: Number,
        required: true
    },
    currentBid: {
        type: Number,
        default: 0
    },

    // Location
    address: String,
    city: String,
    area: String,
    state: String,
    country: String,
    landmark: String,
    lat: Number,
    lng: Number,

    // Features
    bedrooms: Number,
    bathrooms: Number,
    areaSize: Number,
    amenities: [String],

    // Media
    images: [String],
    documents: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],

    // Bidding Stats
    latestBidTime: Date,
    numberOfBidders: {
        type: Number,
        default: 0
    },

    // User Info
    username: String,
    userPicture: String,
    userEmail: String,
    userPhone: String,
    slug: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for performance
auctionSchema.index({ propertyId: 1 });
auctionSchema.index({ currentBid: -1 });

const Auction = mongoose.model<IAuction>('Auction', auctionSchema);

export default Auction;
