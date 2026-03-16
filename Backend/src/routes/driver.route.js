const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { applyDriver, toggleOnline, updateLocation, getAvailableRides, getMyProfile } = require('../controllers/driver.controller');

router.post('/apply',           verifyToken, applyDriver);
router.get('/my-profile',       verifyToken, getMyProfile);
router.patch('/toggle-online',  verifyToken, toggleOnline);
router.patch('/location',       verifyToken, updateLocation);
router.get('/available-rides',  verifyToken, getAvailableRides);

module.exports = router;
