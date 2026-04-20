import express from 'express';
import {
    placeBid,
    getAuctions,
    getAuction,
    getBids
} from '../controllers/auctionController';

import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', getAuctions);
router.get('/:id', getAuction);
router.get('/:propertyId/bids', getBids);
router.post('/bid', protect, placeBid);

export default router;
