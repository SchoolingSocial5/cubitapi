import { Request, Response, NextFunction } from 'express';
import Material, { IMaterial } from '../models/Material';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middleware/asyncHandler';
import paginate from '../utils/paginate';

// @desc    Get all materials
// @route   GET /api/v1/materials
// @access  Public
export const getMaterials = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const results = await paginate(Material, req);
    res.status(200).json(results);
});

// @desc    Get single material
// @route   GET /api/v1/materials/:id
// @access  Public
export const getMaterial = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const material = await Material.findById(req.params.id);

    if (!material) {
        return next(new ErrorResponse(`Material not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: material
    });
});

// @desc    Create material
// @route   POST /api/v1/materials
// @access  Private
export const createMaterial = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    req.body.userId = req.user.id;
    req.body.username = req.user.username;
    const fullName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    req.body.vendorName = fullName || req.user.username;

    const material = await Material.create(req.body);

    res.status(201).json({
        success: true,
        data: material
    });
});

// @desc    Update material
// @route   PUT /api/v1/materials/:id
// @access  Private
export const updateMaterial = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    let material = await Material.findById(req.params.id);

    if (!material) {
        return next(new ErrorResponse(`Material not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is material owner
    if (material.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this material`, 401));
    }

    if (req.body.vendorName) {
        const fullName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
        req.body.vendorName = fullName || req.user.username;
    }

    material = await Material.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: material
    });
});

// @desc    Delete material
// @route   DELETE /api/v1/materials/:id
// @access  Private
export const deleteMaterial = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const material = await Material.findById(req.params.id);

    if (!material) {
        return next(new ErrorResponse(`Material not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is material owner
    if (material.userId !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this material`, 401));
    }

    await material.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
