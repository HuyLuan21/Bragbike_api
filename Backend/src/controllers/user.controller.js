// src/controllers/user.controller.js
const userService = require("../services/user.service");

const getMe = async (req, res, next) => {
  try {
    res.json(await userService.getMe(req.user.id));
  } catch (e) {
    next(e);
  }
};

const updateMe = async (req, res, next) => {
  try {
    await userService.updateMe(req.user.id, req.body);
    res.json({ message: "Cập nhật thành công" });
  } catch (e) {
    next(e);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (e) {
    next(e);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    await userService.updateAvatar(req.user.id, req.body.avatar_url);
    res.json({ message: "Cập nhật avatar thành công" });
  } catch (e) {
    next(e);
  }
};

module.exports = { getMe, updateMe, changePassword, updateAvatar };
