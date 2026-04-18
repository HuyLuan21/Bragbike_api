// src/services/user.service.js
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const { User } = require("../models");

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw createError(404, "Không tìm thấy user");
  return user;
};

const updateMe = async (userId, { full_name, email, avatar_url }) => {
  await User.update(
    { full_name, email, avatar_url },
    { where: { id: userId } },
  );
};

const changePassword = async (userId, { old_password, new_password }) => {
  if (!old_password || !new_password)
    throw createError(400, "Thiếu mật khẩu cũ hoặc mới");
  const user = await User.findByPk(userId);
  const match = await bcrypt.compare(old_password, user.password);
  if (!match) throw createError(401, "Mật khẩu cũ không đúng");
  const hash = await bcrypt.hash(new_password, 10);
  await User.update({ password: hash }, { where: { id: userId } });
};

const updateAvatar = async (userId, avatar_url) => {
  if (!avatar_url) throw createError(400, "Thiếu avatar_url");
  await User.update({ avatar_url }, { where: { id: userId } });
};

module.exports = { getMe, updateMe, changePassword, updateAvatar };
