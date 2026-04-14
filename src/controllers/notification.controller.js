// src/controllers/notification.controller.js
const notifService = require("../services/notification.service");

const getMyNotifications = async (req, res, next) => {
  try {
    res.json(await notifService.getMyNotifications(req.user.id, req.query));
  } catch (e) {
    next(e);
  }
};
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    res.json({ unread_count: count });
  } catch (e) {
    next(e);
  }
};
const markAsRead = async (req, res, next) => {
  try {
    await notifService.markAsRead(req.user.id, req.params.id);
    res.json({ message: "Đã đánh dấu đọc" });
  } catch (e) {
    next(e);
  }
};
const markAllAsRead = async (req, res, next) => {
  try {
    await notifService.markAllAsRead(req.user.id);
    res.json({ message: "Đã đọc tất cả" });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
