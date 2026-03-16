const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

router.get('/',                 verifyToken, getMyNotifications);
router.patch('/read-all',       verifyToken, markAllAsRead);
router.patch('/:id/read',       verifyToken, markAsRead);

module.exports = router;
