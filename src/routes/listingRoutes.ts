import express from 'express';
import {
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing,
    getMyDraft,
    getMyListings,
    getListingBySlug
} from '../controllers/listingController';

import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router
    .route('/')
    .get(getListings)
    .post(protect, createListing);

router.get('/my-draft', protect, getMyDraft);
router.get('/my-listings', protect, getMyListings);
router.get('/slug/:slug', getListingBySlug);

router
    .route('/:id')
    .get(getListing)
    .put(protect, updateListing)
    .delete(protect, deleteListing);

export default router;
