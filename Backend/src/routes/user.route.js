const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { getMe, updateMe, changePassword } = require('../controllers/user.controller');

router.get('/me',              verifyToken, getMe);
router.put('/me',              verifyToken, updateMe);
router.put('/me/password',     verifyToken, changePassword);

module.exports = router;
