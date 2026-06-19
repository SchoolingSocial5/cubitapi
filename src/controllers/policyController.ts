import { Request, Response } from 'express';
import Policy from '../models/Policy';

// @desc    Get all policies
// @route   GET /api/v1/policies
// @access  Public
export const getPolicies = async (req: Request, res: Response) => {
    try {
        const policies = await Policy.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: policies });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching policies' });
    }
};

// @desc    Create a policy
// @route   POST /api/v1/policies
// @access  Private/Admin
export const createPolicy = async (req: Request, res: Response) => {
    try {
        const { title, category, content } = req.body;
        
        if (!title || !category || !content) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const policy = await Policy.create({ title, category, content });
        res.status(201).json({ success: true, data: policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error creating policy' });
    }
};

// @desc    Delete a policy
// @route   DELETE /api/v1/policies/:id
// @access  Private/Admin
export const deletePolicy = async (req: Request, res: Response) => {
    try {
        const policy = await Policy.findByIdAndDelete(req.params.id);
        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error deleting policy' });
    }
};

// @desc    Update a policy
// @route   PUT /api/v1/policies/:id
// @access  Private/Admin
export const updatePolicy = async (req: Request, res: Response) => {
    try {
        const { title, category, content } = req.body;
        
        let policy = await Policy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        policy = await Policy.findByIdAndUpdate(
            req.params.id,
            { title, category, content },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error updating policy' });
    }
};
