import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    materialId: string;
    quantity: number;
    material?: any; // Populated field
}

export interface ICart extends Document {
    userId: string;
    items: ICartItem[];
}

const cartItemSchema = new Schema({
    materialId: {
        type: Schema.Types.ObjectId,
        ref: 'Material',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to populate material details
cartSchema.virtual('items.material', {
    ref: 'Material',
    localField: 'items.materialId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model<ICart>('Cart', cartSchema);
