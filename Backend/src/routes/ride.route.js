const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { createRide, getRideById, updateRideStatus, getUserRideHistory, getDriverRideHistory, getPricing } = require('../controllers/ride.controller');

router.get('/pricing',          getPricing);                    // public
router.post('/',                verifyToken, createRide);
router.get('/history',          verifyToken, getUserRideHistory);
router.get('/driver/history',   verifyToken, getDriverRideHistory);
router.get('/:id',              verifyToken, getRideById);
router.patch('/:id/status',     verifyToken, updateRideStatus);

module.exports = router;
