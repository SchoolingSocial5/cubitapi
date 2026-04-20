import { Request, Response, NextFunction } from 'express';
import Place from '../models/Place';
import ErrorResponse from '../utils/errorResponse';

// @desc    Get all unique countries
// @route   GET /api/v1/places/countries
// @access  Public
export const getCountries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const countries = await Place.aggregate([
            {
                $group: {
                    _id: "$country",
                    country: { $first: "$country" },
                    continent: { $first: "$continent" },
                    countryFlag: { $first: "$countryFlag" },
                    countryCode: { $first: "$countryCode" },
                    countrySymbol: { $first: "$countrySymbol" },
                    currency: { $first: "$currency" },
                    currencySymbol: { $first: "$currencySymbol" }
                }
            },
            { $sort: { country: 1 } }
        ]);

        res.status(200).json({
            success: true,
            count: countries.length,
            data: countries
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get unique states by country
// @route   GET /api/v1/places/states/:country
// @access  Public
export const getStatesByCountry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const states = await Place.distinct('state', { country: req.params.country });

        res.status(200).json({
            success: true,
            count: states.length,
            data: states.sort()
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get unique areas by country and state
// @route   GET /api/v1/places/areas/:country/:state
// @access  Public
export const getAreasByState = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const areas = await Place.distinct('area', {
            country: req.params.country,
            state: req.params.state
        });

        res.status(200).json({
            success: true,
            count: areas.length,
            data: areas.sort()
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all details for a specific area (to get landmark, etc.)
// @route   GET /api/v1/places/:country/:state/:area
// @access  Public
export const getPlaceDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const places = await Place.find({
            country: req.params.country,
            state: req.params.state,
            area: req.params.area
        });

        res.status(200).json({
            success: true,
            count: places.length,
            data: places
        });
    } catch (err) {
        next(err);
    }
};
