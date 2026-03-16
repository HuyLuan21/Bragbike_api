const { Ride, Driver, User, sequelize } = require('../models');
const { calculateFare } = require('../utils/pricing');

const createRide = async (req, res) => {
  const { vehicle_type, pickup_address, pickup_lat, pickup_lng,
          drop_address, drop_lat, drop_lng, distance_km,
          estimated_duration_min, route_polyline } = req.body;
  try {
    const fare = await calculateFare(vehicle_type, distance_km);
    const ride = await Ride.create({
      user_id: req.user.id, vehicle_type,
      pickup_address, pickup_lat, pickup_lng,
      drop_address,   drop_lat,   drop_lng,
      distance_km, estimated_duration_min, route_polyline,
      ...fare,
    });
    await sequelize.query(
      'INSERT INTO ride_status_history (ride_id, status) VALUES (?, ?)',
      { replacements: [ride.id, 'SEARCHING'] }
    );
    res.status(201).json({ message: 'Đặt xe thành công', rideId: ride.id, fare });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findByPk(req.params.id, {
      include: [
        { model: User,   as: 'user',   attributes: ['full_name','phone'] },
        { model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['full_name','phone'] }] },
      ],
    });
    if (!ride) return res.status(404).json({ message: 'Không tìm thấy chuyến' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateRideStatus = async (req, res) => {
  const { status, cancel_reason } = req.body;
  const valid = ['DRIVER_ACCEPTED','ON_THE_WAY','ARRIVED','IN_PROGRESS','COMPLETED','CANCELLED'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });

  try {
    const ride = await Ride.findByPk(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Không tìm thấy chuyến' });

    const updates = { status };
    if (status === 'DRIVER_ACCEPTED') {
      const driver = await Driver.findOne({ where: { user_id: req.user.id } });
      if (!driver) return res.status(403).json({ message: 'Không phải tài xế' });
      updates.driver_id = driver.id;
    }
    if (status === 'IN_PROGRESS') updates.started_at  = new Date();
    if (status === 'COMPLETED')   updates.completed_at = new Date();
    if (status === 'CANCELLED') {
      updates.cancelled_by  = req.user.role === 'DRIVER' ? 'DRIVER' : 'USER';
      updates.cancel_reason = cancel_reason || null;
    }

    await ride.update(updates);

    if (status === 'COMPLETED' && ride.driver_id) {
      await Driver.increment('total_trips', { where: { id: ride.driver_id } });
    }
    await sequelize.query(
      'INSERT INTO ride_status_history (ride_id, status) VALUES (?, ?)',
      { replacements: [req.params.id, status] }
    );
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getUserRideHistory = async (req, res) => {
  try {
    const rides = await Ride.findAll({
      where:   { user_id: req.user.id },
      include: [{ model: Driver, as: 'driver', include: [{ model: User, as: 'user', attributes: ['full_name'] }] }],
      order:   [['created_at', 'DESC']],
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getDriverRideHistory = async (req, res) => {
  try {
    const driver = await Driver.findOne({ where: { user_id: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'Không tìm thấy tài xế' });

    const rides = await Ride.findAll({
      where:   { driver_id: driver.id },
      include: [{ model: User, as: 'user', attributes: ['full_name','phone'] }],
      order:   [['created_at', 'DESC']],
    });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const getPricing = async (req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT * FROM vehicle_pricing');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { createRide, getRideById, updateRideStatus, getUserRideHistory, getDriverRideHistory, getPricing };
