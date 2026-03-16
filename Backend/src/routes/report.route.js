const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { createReport, getMyReports } = require('../controllers/report.controller');

router.post('/',    verifyToken, createReport);
router.get('/my',  verifyToken, getMyReports);

module.exports = router;
