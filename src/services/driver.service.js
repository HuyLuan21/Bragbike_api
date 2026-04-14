// src/services/driver.service.js
const createError = require("http-errors");
const { Driver, Ride, User, DriverApplication, Rating } = require("../models");
const { fn, col } = require("sequelize");

const applyDriver = async (userId, data) => {
  const existing = await DriverApplication.findOne({
    where: { user_id: userId, status: "PENDING" },
  });
  if (existing) throw createError(409, "Đơn đăng ký đang chờ duyệt");
  await DriverApplication.create({ user_id: userId, ...data });
};

const getMyProfile = async (userId) => {
  const driver = await Driver.findOne({
    where: { user_id: userId },
    include: [
      { model: User, as: "user", attributes: { exclude: ["password"] } },
    ],
  });
  if (!driver) throw createError(404, "Chưa có hồ sơ tài xế");
  return driver;
};

const getMyStats = async (userId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(404, "Chưa có hồ sơ tài xế");

  const [totalRevenue] = await Promise.all([
    Ride.sum("total_price", {
      where: { driver_id: driver.id, status: "COMPLETED" },
    }),
  ]);

  return {
    total_trips: driver.total_trips,
    total_revenue: totalRevenue || 0,
    avg_rating: driver.avg_rating,
    is_online: driver.is_online,
    is_locked: driver.is_locked,
  };
};

const toggleOnline = async (userId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(404, "Chưa có hồ sơ tài xế");
  if (driver.is_locked) throw createError(403, "Tài khoản đang bị khóa");
  driver.is_online = !driver.is_online;
  await driver.save();
  return { is_online: driver.is_online };
};

const updateLocation = async (userId, { lat, lng }) => {
  if (!lat || !lng) throw createError(400, "Thiếu lat hoặc lng");
  await Driver.update({ lat, lng }, { where: { user_id: userId } });
};

const getAvailableRides = async (userId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(404, "Không tìm thấy tài xế");
  if (driver.is_locked) throw createError(403, "Tài khoản đang bị khóa");
  if (!driver.is_online) throw createError(403, "Bạn đang offline");

  return Ride.findAll({
    where: { status: "SEARCHING", vehicle_type: driver.vehicle_type },
    include: [{ model: User, as: "user", attributes: ["full_name", "phone"] }],
    order: [["created_at", "ASC"]],
  });
};

const getMyRideHistory = async (userId, { status, page = 1, limit = 10 }) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(404, "Chưa có hồ sơ tài xế");

  const where = { driver_id: driver.id };
  if (status) where.status = status;

  return Ride.findAll({
    where,
    include: [{ model: User, as: "user", attributes: ["full_name", "phone"] }],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
};

const getDriverPublic = async (id) => {
  const driver = await Driver.findByPk(id, {
    attributes: [
      "id",
      "vehicle_type",
      "vehicle_name",
      "license_plate",
      "avg_rating",
      "total_trips",
    ],
    include: [
      { model: User, as: "user", attributes: ["full_name", "avatar_url"] },
    ],
  });
  if (!driver) throw createError(404, "Không tìm thấy tài xế");
  return driver;
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
