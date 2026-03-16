// src/services/appeal.service.js
const createError = require("http-errors");
const { DriverAppeal, DriverLockHistory, Driver } = require("../models");

const createAppeal = async (
  userId,
  { lock_history_id, message, evidence_url },
) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(403, "Bạn không phải tài xế");

  const lockHistory = await DriverLockHistory.findOne({
    where: { id: lock_history_id, driver_id: driver.id, unlocked_at: null },
  });
  if (!lockHistory) throw createError(404, "Không tìm thấy lệnh khóa");

  const deadline = new Date(lockHistory.locked_at);
  deadline.setDate(deadline.getDate() + 3);
  if (new Date() > deadline)
    throw createError(400, "Đã quá 3 ngày, không thể kháng cáo");

  const existing = await DriverAppeal.findOne({
    where: { driver_id: driver.id, lock_history_id },
  });
  if (existing)
    throw createError(409, "Bạn đã gửi kháng cáo cho lệnh khóa này");

  return DriverAppeal.create({
    driver_id: driver.id,
    lock_history_id,
    message,
    evidence_url: evidence_url || null,
  });
};

const getMyAppeals = async (userId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(403, "Bạn không phải tài xế");
  return DriverAppeal.findAll({
    where: { driver_id: driver.id },
    order: [["created_at", "DESC"]],
  });
};

const getAppealById = async (userId, appealId) => {
  const driver = await Driver.findOne({ where: { user_id: userId } });
  if (!driver) throw createError(403, "Bạn không phải tài xế");

  const appeal = await DriverAppeal.findOne({
    where: { id: appealId, driver_id: driver.id },
  });
  if (!appeal) throw createError(404, "Không tìm thấy kháng cáo");
  return appeal;
};

module.exports = { createAppeal, getMyAppeals, getAppealById };
