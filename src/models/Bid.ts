import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
    propertyId: mongoose.Types.ObjectId;
    userId: string;
    username: string;
    userEmail: string;
    userPhone: string;
    amount: number;
    createdAt: Date;
}

const bidSchema: Schema = new Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPhone: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Index for quick retrieval of bids for a property
bidSchema.index({ propertyId: 1, createdAt: -1 });

const Bid = mongoose.model<IBid>('Bid', bidSchema);

export default Bid;
