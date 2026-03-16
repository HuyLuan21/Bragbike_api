// Dùng sau verifyToken
// Ví dụ: router.get('/admin', verifyToken, requireRole('ADMIN'), ...)

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

module.exports = { requireRole };
