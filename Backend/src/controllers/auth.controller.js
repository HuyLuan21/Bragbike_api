const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  const { full_name, phone, email, password } = req.body;
  if (!full_name || !phone || !password)
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  try {
    const exist = await User.findOne({ where: { phone } });
    if (exist) return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ full_name, phone, email: email || null, password: hash });
    res.status(201).json({ message: 'Đăng ký thành công', userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Thiếu thông tin' });
  try {
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    if (!user.is_active) return res.status(403).json({ message: 'Tài khoản đã bị khóa' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({
      message: 'Đăng nhập thành công', token,
      user: { id: user.id, full_name: user.full_name, phone: user.phone, role: user.role, avatar_url: user.avatar_url },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { register, login };
