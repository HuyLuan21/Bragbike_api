// src/services/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { User } = require("../models");
const { redisClient } = require("../config/redis");

const register = async ({ full_name, phone, email, password }) => {
  const exist = await User.findOne({ where: { phone } });
  if (exist) throw createError(409, "Số điện thoại đã tồn tại");

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    full_name,
    phone,
    email: email || null,
    password: hash,
  });
  return { userId: user.id };
};

const login = async ({ phone, password }) => {
  const user = await User.findOne({ where: { phone } });
  if (!user) throw createError(404, "Tài khoản không tồn tại");
  if (!user.is_active) throw createError(403, "Tài khoản đã bị khóa");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw createError(401, "Sai mật khẩu");

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
    },
  };
};

const refreshToken = async (token) => {
  if (!token) throw createError(400, "Thiếu token");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) throw createError(401, "Token không hợp lệ");

    const newToken = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );
    return { token: newToken };
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw createError(401, "Token đã hết hạn, vui lòng đăng nhập lại");
    throw err;
  }
};

const forgotPassword = async ({ phone }) => {
  const user = await User.findOne({ where: { phone } });
  if (!user) throw createError(404, "Tài khoản không tồn tại");
  if (!user.is_active) throw createError(403, "Tài khoản đã bị khóa");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`otp:forgot_password:${phone}`, 300, otp);
  console.log(otp);
  // Hiện tại trả luôn OTP về trong response để frontend/bên thứ 3 có thể nhận
  return {
    message: "Mã OTP đã tạo thành công",
    otp: otp,
  };
};

const resetPassword = async ({ phone, otp, new_password }) => {
  const user = await User.findOne({ where: { phone } });
  if (!user) throw createError(404, "Tài khoản không tồn tại");
  if (!user.is_active) throw createError(403, "Tài khoản đã bị khóa");

  const cachedOtp = await redisClient.get(`otp:forgot_password:${phone}`);
  if (!cachedOtp) throw createError(400, "Mã OTP đã hết hạn hoặc không hợp lệ");
  if (cachedOtp !== otp) throw createError(400, "Mã OTP không chính xác");

  const hash = await bcrypt.hash(new_password, 10);
  user.password = hash;
  await user.save();

  await redisClient.del(`otp:forgot_password:${phone}`);

  return { message: "Đổi mật khẩu thành công" };
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
