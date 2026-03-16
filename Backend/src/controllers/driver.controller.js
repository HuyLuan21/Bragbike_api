// src/controllers/driver.controller.js
const driverService = require("../services/driver.service");

const applyDriver = async (req, res, next) => {
  try {
    await driverService.applyDriver(req.user.id, req.body);
    res.status(201).json({ message: "Nộp đơn thành công, chờ admin duyệt" });
  } catch (e) {
    next(e);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    res.json(await driverService.getMyProfile(req.user.id));
  } catch (e) {
    next(e);
  }
};

const getMyStats = async (req, res, next) => {
  try {
    res.json(await driverService.getMyStats(req.user.id));
  } catch (e) {
    next(e);
  }
};

const toggleOnline = async (req, res, next) => {
  try {
    const { is_online } = await driverService.toggleOnline(req.user.id);
    res.json({
      message: is_online ? "Đã bật nhận chuyến" : "Đã tắt nhận chuyến",
      is_online,
    });
  } catch (e) {
    next(e);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    await driverService.updateLocation(req.user.id, req.body);
    res.json({ message: "Cập nhật vị trí thành công" });
  } catch (e) {
    next(e);
  }
};

const getAvailableRides = async (req, res, next) => {
  try {
    res.json(await driverService.getAvailableRides(req.user.id));
  } catch (e) {
    next(e);
  }
};

const getMyRideHistory = async (req, res, next) => {
  try {
    res.json(await driverService.getMyRideHistory(req.user.id, req.query));
  } catch (e) {
    next(e);
  }
};

const getDriverPublic = async (req, res, next) => {
  try {
    res.json(await driverService.getDriverPublic(req.params.id));
  } catch (e) {
    next(e);
  }
};

module.exports = {
  applyDriver,
  getMyProfile,
  getMyStats,
  toggleOnline,
  updateLocation,
  getAvailableRides,
  getMyRideHistory,
  getDriverPublic,
};
