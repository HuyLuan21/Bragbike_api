// src/services/rating.service.js
const createError = require("http-errors");
const { Rating, Ride, Driver, User } = require("../models");
const { fn, col } = require("sequelize");

const createRating = async (userId, { ride_id, stars, comment }) => {
  if (!ride_id || !stars) throw createError(400, "Thiếu thông tin");

  const ride = await Ride.findOne({
    where: { id: ride_id, user_id: userId, status: "COMPLETED" },
  });
  if (!ride) throw createError(400, "Chuyến không hợp lệ để đánh giá");
  if (!ride.driver_id) throw createError(400, "Chuyến không có tài xế");

  try {
    await Rating.create({
      ride_id,
      user_id: userId,
      driver_id: ride.driver_id,
      stars,
      comment,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      throw createError(409, "Chuyến này đã được đánh giá");
    throw err;
  }

  // Cập nhật avg_rating
  const avg = await Rating.findOne({
    where: { driver_id: ride.driver_id },
    attributes: [[fn("AVG", col("stars")), "avg"]],
    raw: true,
  });
  await Driver.update(
    { avg_rating: parseFloat(avg.avg).toFixed(2) },
    { where: { id: ride.driver_id } },
  );
};

const getRatingByRide = async (rideId) => {
  const rating = await Rating.findOne({
    where: { ride_id: rideId },
    include: [
      { model: User, as: "user", attributes: ["full_name", "avatar_url"] },
    ],
  });
  if (!rating) throw createError(404, "Chưa có đánh giá cho chuyến này");
  return rating;
};

const getDriverRatings = async (driverId) => {
  return Rating.findAll({
    where: { driver_id: driverId },
    include: [
      { model: User, as: "user", attributes: ["full_name", "avatar_url"] },
    ],
    order: [["created_at", "DESC"]],
  });
};

module.exports = { createRating, getRatingByRide, getDriverRatings };
 