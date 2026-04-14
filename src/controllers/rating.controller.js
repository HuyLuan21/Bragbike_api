// src/controllers/rating.controller.js
const ratingService = require("../services/rating.service");

const createRating = async (req, res, next) => {
  try {
    await ratingService.createRating(req.user.id, req.body);
    res.status(201).json({ message: "Đánh giá thành công" });
  } catch (e) {
    next(e);
  }
};
const getRatingByRide = async (req, res, next) => {
  try {
    res.json(await ratingService.getRatingByRide(req.params.rideId));
  } catch (e) {
    next(e);
  }
};
const getDriverRatings = async (req, res, next) => {
  try {
    res.json(await ratingService.getDriverRatings(req.params.driverId));
  } catch (e) {
    next(e);
  }
};

module.exports = { createRating, getRatingByRide, getDriverRatings };
