// src/services/notification.service.js
const { Notification } = require("../models");

const getMyNotifications = async (userId, { page = 1, limit = 20 }) => {
  return Notification.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
};

const getUnreadCount = async (userId) => {
  return Notification.count({ where: { user_id: userId, is_read: false } });
};

const markAsRead = async (userId, notifId) => {
  await Notification.update(
    { is_read: true },
    { where: { id: notifId, user_id: userId } },
  );
};

const markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } },
  );
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
