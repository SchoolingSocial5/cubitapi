import { Request, Response } from 'express';
import Blog from '../models/Blog';

// @desc    Get all blogs
// @route   GET /api/v1/blogs
// @access  Public
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching blogs' });
    }
};

// @desc    Create a blog
// @route   POST /api/v1/blogs
// @access  Private/Admin
export const createBlog = async (req: Request, res: Response) => {
    try {
        const { title, content, author, image, tags } = req.body;
        
        if (!title || !content || !author) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const blog = await Blog.create({ title, content, author, image, tags });
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error creating blog' });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/v1/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error deleting blog' });
    }
};
