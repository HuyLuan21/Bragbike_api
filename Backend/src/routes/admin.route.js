const router = require('express').Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/admin.controller');

const admin = [verifyToken, requireRole('ADMIN')];

router.get('/stats',                        ...admin, ctrl.getStats);
router.get('/reports',                      ...admin, ctrl.getPendingReports);
router.patch('/reports/:id',                ...admin, ctrl.reviewReport);
router.patch('/drivers/:id/lock',           ...admin, ctrl.lockDriver);
router.patch('/drivers/:id/unlock',         ...admin, ctrl.unlockDriver);
router.get('/appeals',                      ...admin, ctrl.getPendingAppeals);
router.patch('/appeals/:id',                ...admin, ctrl.reviewAppeal);
router.get('/driver-applications',          ...admin, ctrl.getDriverApplications);
router.patch('/driver-applications/:id',    ...admin, ctrl.reviewDriverApplication);

module.exports = router;
