const { User, Driver, Report, Notification, Ride, sequelize } = require('../models');
const { fn, col, literal } = require('sequelize');

const getPendingReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where:   { status: 'PENDING' },
      include: [
        { model: User,   as: 'reporter', attributes: ['full_name','phone'] },
        { model: Driver, as: 'driver',   include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
      ],
      order: [['created_at', 'ASC']],
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const reviewReport = async (req, res) => {
  const { status, admin_note } = req.body;
  try {
    await Report.update(
      { status, admin_note, reviewed_by: req.user.id, reviewed_at: new Date() },
      { where: { id: req.params.id } }
    );
    res.json({ message: 'Đã xử lý tố cáo' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const lockDriver = async (req, res) => {
  const { reason, report_id } = req.body;
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Không tìm thấy tài xế' });

    await driver.update({ is_locked: true, locked_at: new Date(), locked_reason: reason });
    await sequelize.query(
      'INSERT INTO driver_lock_history (driver_id, locked_by, reason, report_id) VALUES (?,?,?,?)',
      { replacements: [driver.id, req.user.id, reason, report_id || null] }
    );
    await Notification.create({
      user_id: driver.user_id,
      title:   'Tài khoản bị khóa',
      body:    `Lý do: ${reason}`,
      type:    'LOCK',
      ref_id:  driver.id,
    });
    res.json({ message: 'Đã khóa tài xế' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const unlockDriver = async (req, res) => {
  try {
    await Driver.update(
      { is_locked: false, locked_at: null, locked_reason: null },
      { where: { id: req.params.id } }
    );
    await sequelize.query(
      'UPDATE driver_lock_history SET unlocked_at = NOW() WHERE driver_id = ? AND unlocked_at IS NULL',
      { replacements: [req.params.id] }
    );
    res.json({ message: 'Đã mở khóa tài xế' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getPendingAppeals = async (req, res) => {
  try {
    const [appeals] = await sequelize.query(
      `SELECT da.*, u.full_name as driver_name, u.phone as driver_phone
       FROM driver_appeals da
       JOIN drivers d ON da.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE da.status = 'PENDING' ORDER BY da.created_at ASC`
    );
    res.json(appeals);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const reviewAppeal = async (req, res) => {
  const { status, admin_response } = req.body;
  try {
    await sequelize.query(
      'UPDATE driver_appeals SET status=?, admin_response=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?',
      { replacements: [status, admin_response, req.user.id, req.params.id] }
    );
    if (status === 'APPROVED') {
      const [[appeal]] = await sequelize.query('SELECT driver_id FROM driver_appeals WHERE id=?', { replacements: [req.params.id] });
      await Driver.update({ is_locked: false, locked_at: null, locked_reason: null }, { where: { id: appeal.driver_id } });
      await sequelize.query(
        'UPDATE driver_lock_history SET unlocked_at=NOW() WHERE driver_id=? AND unlocked_at IS NULL',
        { replacements: [appeal.driver_id] }
      );
    }
    res.json({ message: 'Đã xử lý kháng cáo' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getDriverApplications = async (req, res) => {
  try {
    const [apps] = await sequelize.query(
      `SELECT da.*, u.full_name, u.phone FROM driver_applications da
       JOIN users u ON da.user_id = u.id WHERE da.status='PENDING' ORDER BY da.submitted_at ASC`
    );
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const reviewDriverApplication = async (req, res) => {
  const { status, rejection_reason, vehicle_type, vehicle_name, license_plate } = req.body;
  try {
    const [[app]] = await sequelize.query('SELECT * FROM driver_applications WHERE id=?', { replacements: [req.params.id] });
    if (!app) return res.status(404).json({ message: 'Không tìm thấy đơn' });

    await sequelize.query(
      'UPDATE driver_applications SET status=?, rejection_reason=?, reviewed_by=?, reviewed_at=NOW() WHERE id=?',
      { replacements: [status, rejection_reason || null, req.user.id, req.params.id] }
    );
    if (status === 'APPROVED') {
      await Driver.create({ user_id: app.user_id, vehicle_type, vehicle_name, license_plate });
      await User.update({ role: 'DRIVER' }, { where: { id: app.user_id } });
    }
    res.json({ message: `Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} đơn` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers   = await User.count({ where: { role: 'USER' } });
    const totalDrivers = await Driver.count();
    const totalRides   = await Ride.count({ where: { status: 'COMPLETED' } });
    const revenue      = await Ride.sum('total_price', { where: { status: 'COMPLETED' } });
    const pendingRep   = await Report.count({ where: { status: 'PENDING' } });

    res.json({
      total_users:     totalUsers,
      total_drivers:   totalDrivers,
      total_rides:     totalRides,
      total_revenue:   revenue || 0,
      pending_reports: pendingRep,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = {
  getPendingReports, reviewReport,
  lockDriver, unlockDriver,
  getPendingAppeals, reviewAppeal,
  getDriverApplications, reviewDriverApplication,
  getStats,
};
