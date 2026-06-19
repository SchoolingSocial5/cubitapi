import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    content: string;
    author: string;
    image?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const blogSchema: Schema = new Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

const Blog = mongoose.model<IBlog>('Blog', blogSchema);

export default Blog;
