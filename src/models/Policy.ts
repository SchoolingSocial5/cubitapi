import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicy extends Document {
    title: string;
    category: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const policySchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Policy title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Policy category is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Policy content is required']
    }
}, {
    timestamps: true
});

const Policy = mongoose.model<IPolicy>('Policy', policySchema);

export default Policy;
