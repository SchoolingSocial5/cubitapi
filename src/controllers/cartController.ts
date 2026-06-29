import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import Cart from '../models/Cart';
import ErrorResponse from '../utils/errorResponse';

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userReq = req as any;
    let cart = await Cart.findOne({ userId: userReq.user.id }).populate('items.materialId');

    if (!cart) {
        cart = await Cart.create({ userId: userReq.user.id, items: [] });
    }

    // Format the response to map materialId to material
    const formattedCart = {
        ...cart.toObject(),
        items: cart.items.map((item: any) => ({
            material: item.materialId,
            quantity: item.quantity
        }))
    };

    res.status(200).json({
        success: true,
        data: formattedCart
    });
});

// @desc    Sync cart (merge or overwrite)
// @route   POST /api/v1/cart/sync
// @access  Private
export const syncCart = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userReq = req as any;
    const { items } = req.body; // Array of { materialId, quantity }

    if (!items || !Array.isArray(items)) {
        return next(new ErrorResponse('Please provide an array of items', 400));
    }

    let cart = await Cart.findOne({ userId: userReq.user.id });

    if (!cart) {
        cart = await Cart.create({ userId: userReq.user.id, items });
    } else {
        // Simple override with incoming items for this implementation
        cart.items = items;
        await cart.save();
    }

    cart = await cart.populate('items.materialId');

    const formattedCart = {
        ...cart.toObject(),
        items: cart.items.map((item: any) => ({
            material: item.materialId,
            quantity: item.quantity
        }))
    };

    res.status(200).json({
        success: true,
        data: formattedCart
    });
});
