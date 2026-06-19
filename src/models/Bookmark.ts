import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
    userId: string;
    propertyId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const bookmarkSchema: Schema = new Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        index: true
    },
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: [true, 'Property ID is required'],
        index: true
    }
}, {
    timestamps: true
});

// Ensure a user can only bookmark a specific property once
bookmarkSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

export default Bookmark;
