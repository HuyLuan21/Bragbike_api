const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { createRating, getDriverRatings } = require('../controllers/rating.controller');

router.post('/',                    verifyToken, createRating);
router.get('/driver/:driverId',     getDriverRatings);   // public

module.exports = router;
