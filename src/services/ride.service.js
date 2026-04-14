// src/services/ride.service.js
const createError = require("http-errors");
const { Ride, Driver, User, RideStatusHistory } = require("../models");
const { calculateFare } = require("../utils/pricing");

const estimateFare = async ({ vehicle_type, distance_km }) => {
  if (!vehicle_type || !distance_km)
    throw createError(400, "Thiếu vehicle_type hoặc distance_km");
  return calculateFare(vehicle_type, parseFloat(distance_km));
};

const createRide = async (userId, data) => {
  const { vehicle_type, distance_km } = data;
  const fare = await calculateFare(vehicle_type, distance_km);
  const ride = await Ride.create({ user_id: userId, ...data, ...fare });
  await RideStatusHistory.create({ ride_id: ride.id, status: "SEARCHING" });
  return { rideId: ride.id, fare };
};

const getRideById = async (id) => {
  const ride = await Ride.findByPk(id, {
    include: [
      { model: User, as: "user", attributes: ["full_name", "phone"] },
      {
        model: Driver,
        as: "driver",
        include: [
          { model: User, as: "user", attributes: ["full_name", "phone"] },
        ],
      },
    ],
  });
  if (!ride) throw createError(404, "Không tìm thấy chuyến");
  return ride;
};

const getRideStatusHistory = async (rideId) => {
  return RideStatusHistory.findAll({
    where: { ride_id: rideId },
    order: [["changed_at", "ASC"]],
  });
};

const getUserRideHistory = async (userId, { status, page = 1, limit = 10 }) => {
  const where = { user_id: userId };
  if (status) where.status = status;
  return Ride.findAll({
    where,
    include: [
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user", attributes: ["full_name"] }],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
};

const acceptRide = async (userId, rideId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(403, "Không phải tài xế");

  const ride = await Ride.findByPk(rideId);
  if (!ride) throw createError(404, "Không tìm thấy chuyến");
  if (ride.status !== "SEARCHING")
    throw createError(400, "Chuyến không còn khả dụng");

  await ride.update({ status: "DRIVER_ACCEPTED", driver_id: driver.id });
  await RideStatusHistory.create({
    ride_id: ride.id,
    status: "DRIVER_ACCEPTED",
  });
};

const pickupRide = async (userId, rideId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  const ride = await Ride.findByPk(rideId);
  if (!ride || ride.driver_id !== driver?.id)
    throw createError(403, "Không có quyền");
  if (!["DRIVER_ACCEPTED", "ON_THE_WAY"].includes(ride.status))
    throw createError(400, "Trạng thái không hợp lệ");

  await ride.update({ status: "ARRIVED" });
  await RideStatusHistory.create({ ride_id: ride.id, status: "ARRIVED" });
};

const startRide = async (userId, rideId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  const ride = await Ride.findByPk(rideId);
  if (!ride || ride.driver_id !== driver?.id)
    throw createError(403, "Không có quyền");
  if (ride.status !== "ARRIVED")
    throw createError(400, "Trạng thái không hợp lệ");

  await ride.update({ status: "IN_PROGRESS", started_at: new Date() });
  await RideStatusHistory.create({ ride_id: ride.id, status: "IN_PROGRESS" });
};

const completeRide = async (userId, rideId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  const ride = await Ride.findByPk(rideId);
  if (!ride || ride.driver_id !== driver?.id)
    throw createError(403, "Không có quyền");
  if (ride.status !== "IN_PROGRESS")
    throw createError(400, "Trạng thái không hợp lệ");

  await ride.update({ status: "COMPLETED", completed_at: new Date() });
  await RideStatusHistory.create({ ride_id: ride.id, status: "COMPLETED" });
  await Driver.increment("total_trips", { where: { id: driver.id } });
};

const cancelRide = async (userId, userRole, rideId, cancel_reason) => {
  const ride = await Ride.findByPk(rideId);
  if (!ride) throw createError(404, "Không tìm thấy chuyến");

  const cancellable = ["SEARCHING", "DRIVER_ACCEPTED", "ON_THE_WAY", "ARRIVED"];
  if (!cancellable.includes(ride.status))
    throw createError(400, "Không thể huỷ chuyến ở trạng thái này");

  const cancelled_by = userRole === "DRIVER" ? "DRIVER" : "USER";
  await ride.update({
    status: "CANCELLED",
    cancelled_by,
    cancel_reason: cancel_reason || null,
  });
  await RideStatusHistory.create({
    ride_id: ride.id,
    status: "CANCELLED",
    note: cancel_reason,
  });
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
