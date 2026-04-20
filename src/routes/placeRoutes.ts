import express from 'express';
import {
    getCountries,
    getStatesByCountry,
    getAreasByState,
    getPlaceDetails
} from '../controllers/placeController';

const router = express.Router();

router.get('/countries', getCountries);
router.get('/states/:country', getStatesByCountry);
router.get('/areas/:country/:state', getAreasByState);
router.get('/:country/:state/:area', getPlaceDetails);

export default router;
