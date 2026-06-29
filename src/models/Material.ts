import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
    name: string;
    price: number;
    image?: string;
    video?: string;
    vendorName: string;
    country?: string;
    state?: string;
    area?: string;
    description?: string;
    type: string;
    
    // Meta
    userId: string;
    username?: string;
    createdAt: Date;
    updatedAt: Date;
}

const materialSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    image: {
        type: String
    },
    video: {
        type: String
    },
    vendorName: {
        type: String,
        required: [true, 'Please add a vendor name'],
        trim: true
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    area: {
        type: String
    },
    description: {
        type: String
    },
    type: {
        type: String,
        required: [true, 'Please select a type']
    },
    userId: {
        type: String,
        required: true
    },
    username: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IMaterial>('Material', materialSchema);
