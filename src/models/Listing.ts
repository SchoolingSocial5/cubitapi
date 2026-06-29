import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
    title: string;
    description: string;
    type: 'House' | 'Land' | 'Design';
    category: 'For Sale' | 'For Rent' | 'Auction';
    subType?: string;
    price: number;
    currency: string;

    // Location
    address: string;
    city?: string;
    area: string;
    state: string;
    country: string;
    landmark?: string;
    lat?: number;
    lng?: number;
    coordinates?: { lat: number, lng: number }[];

    // Features
    bedrooms?: number;
    bathrooms?: number;
    areaSize?: number; // Sq Ft
    amenities: string[];

    // Media
    images: string[];
    documents: { name: string, url: string }[];

    // Meta
    userId: string;
    username?: string;
    userPicture?: string;
    userEmail?: string;
    userPhone?: string;
    isPublished: boolean;
    isSold: boolean;
    isAuctioned: boolean;
    plots?: number;
    bookmarks: number;
    isBookmarked?: boolean;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const listingSchema: Schema = new Schema({
    title: {
        type: String,
        required: [function(this: IListing) { return this.isPublished; }, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    slug: String,
    description: {
        type: String,
        maxlength: [2000, 'Description can not be more than 2000 characters']
    },
    type: {
        type: String,
        required: [true, 'Please select a property type'],
        enum: ['House', 'Land', 'Design']
    },
    category: {
        type: String,
        required: [function(this: IListing) { return this.isPublished; }, 'Please select a category'],
        enum: ['For Sale', 'For Rent', 'Auction']
    },
    subType: {
        type: String
    },
    price: {
        type: Number
    },
    currency: {
        type: String,
        default: 'USD'
    },
    address: {
        type: String
    },
    city: String,
    area: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    landmark: String,
    lat: Number,
    lng: Number,
    coordinates: [{
        lat: Number,
        lng: Number
    }],
    bedrooms: Number,
    bathrooms: Number,
    areaSize: Number,
    amenities: [String],
    images: {
        type: [String]
    },
    documents: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],
    userId: {
        type: String
    },
    username: String,
    userPicture: String,
    userEmail: String,
    userPhone: String,
    isPublished: {
        type: Boolean,
        default: false
    },
    isSold: {
        type: Boolean,
        default: false
    },
    isAuctioned: {
        type: Boolean,
        default: false
    },
    plots: {
        type: Number,
        default: 0
    },
    bookmarks: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Set slug to _id for unique permanent links
listingSchema.pre('save', async function (this: IListing) {
    if (this.isNew || !this.slug) {
        this.slug = (this._id as any).toString();
    }
});

const Listing = mongoose.model<IListing>('Listing', listingSchema);

export default Listing;
