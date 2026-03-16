// src/controllers/appeal.controller.js
const appealService = require("../services/appeal.service");

const createAppeal = async (req, res, next) => {
  try {
    const appeal = await appealService.createAppeal(req.user.id, req.body);
    res.status(201).json({ message: "Kháng cáo đã được gửi", data: appeal });
  } catch (e) {
    next(e);
  }
};
const getMyAppeals = async (req, res, next) => {
  try {
    res.json(await appealService.getMyAppeals(req.user.id));
  } catch (e) {
    next(e);
  }
};
const getAppealById = async (req, res, next) => {
  try {
    res.json(await appealService.getAppealById(req.user.id, req.params.id));
  } catch (e) {
    next(e);
  }
};

module.exports = { createAppeal, getMyAppeals, getAppealById };
