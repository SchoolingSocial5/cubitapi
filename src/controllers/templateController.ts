import { Request, Response, NextFunction } from 'express';
import Template from '../models/Template';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/asyncHandler';
import paginate from '../utils/paginate';

// @desc    Get all templates
// @route   GET /api/v1/templates
// @access  Private/Admin-Staff
export const getTemplates = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const results = await paginate(Template, req, 'createdBy');
    res.status(200).json(results);
});

// @desc    Get single template
// @route   GET /api/v1/templates/:id
// @access  Private/Admin-Staff
export const getTemplate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const template = await Template.findById(req.params.id).populate('createdBy', 'username email');

    if (!template) {
        return next(new ErrorResponse(`Template not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: template
    });
});

// @desc    Create template
// @route   POST /api/v1/templates
// @access  Private/Admin-Staff
export const createTemplate = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    req.body.createdBy = req.user.id;

    const template = await Template.create(req.body);

    res.status(201).json({
        success: true,
        data: template
    });
});

// @desc    Update template
// @route   PUT /api/v1/templates/:id
// @access  Private/Admin-Staff
export const updateTemplate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!template) {
        return next(new ErrorResponse(`Template not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: template
    });
});

// @desc    Delete template
// @route   DELETE /api/v1/templates/:id
// @access  Private/Admin-Staff
export const deleteTemplate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
        return next(new ErrorResponse(`Template not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});
