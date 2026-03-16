// src/controllers/auth.controller.js
const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const { full_name, phone, email, password } = req.body;
    if (!full_name || !phone || !password)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    const data = await authService.register({
      full_name,
      phone,
      email,
      password,
    });
    res.status(201).json({ message: "Đăng ký thành công", ...data });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "Thiếu thông tin" });
    const data = await authService.login({ phone, password });
    res.json({ message: "Đăng nhập thành công", ...data });
  } catch (e) {
    next(e);
  }
};

const logout = (req, res) => res.json({ message: "Đăng xuất thành công" });

const refreshToken = async (req, res, next) => {
  try {
    const data = await authService.refreshToken(req.body.token);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

module.exports = { register, login, logout, refreshToken };
