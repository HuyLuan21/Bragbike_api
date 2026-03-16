// src/controllers/ride.controller.js
const rideService = require("../services/ride.service");

const estimateFare = async (req, res, next) => {
  try {
    res.json(await rideService.estimateFare(req.query));
  } catch (e) {
    next(e);
  }
};
const createRide = async (req, res, next) => {
  try {
    const data = await rideService.createRide(req.user.id, req.body);
    res.status(201).json({ message: "Đặt xe thành công", ...data });
  } catch (e) {
    next(e);
  }
};
const getRideById = async (req, res, next) => {
  try {
    res.json(await rideService.getRideById(req.params.id));
  } catch (e) {
    next(e);
  }
};
const getRideStatusHistory = async (req, res, next) => {
  try {
    res.json(await rideService.getRideStatusHistory(req.params.id));
  } catch (e) {
    next(e);
  }
};
const getUserRideHistory = async (req, res, next) => {
  try {
    res.json(await rideService.getUserRideHistory(req.user.id, req.query));
  } catch (e) {
    next(e);
  }
};
const acceptRide = async (req, res, next) => {
  try {
    await rideService.acceptRide(req.user.id, req.params.id);
    res.json({ message: "Đã nhận chuyến" });
  } catch (e) {
    next(e);
  }
};
const pickupRide = async (req, res, next) => {
  try {
    await rideService.pickupRide(req.user.id, req.params.id);
    res.json({ message: "Đã đến điểm đón" });
  } catch (e) {
    next(e);
  }
};
const startRide = async (req, res, next) => {
  try {
    await rideService.startRide(req.user.id, req.params.id);
    res.json({ message: "Bắt đầu hành trình" });
  } catch (e) {
    next(e);
  }
};
const completeRide = async (req, res, next) => {
  try {
    await rideService.completeRide(req.user.id, req.params.id);
    res.json({ message: "Hoàn thành chuyến đi" });
  } catch (e) {
    next(e);
  }
};
const cancelRide = async (req, res, next) => {
  try {
    await rideService.cancelRide(
      req.user.id,
      req.user.role,
      req.params.id,
      req.body.cancel_reason,
    );
    res.json({ message: "Đã huỷ chuyến" });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  estimateFare,
  createRide,
  getRideById,
  getRideStatusHistory,
  getUserRideHistory,
  acceptRide,
  pickupRide,
  startRide,
  completeRide,
  cancelRide,
};
