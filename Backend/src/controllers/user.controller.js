const bcrypt = require('bcrypt');
const { User } = require('../models');

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateMe = async (req, res) => {
  const { full_name, email, avatar_url } = req.body;
  try {
    await User.update({ full_name, email, avatar_url }, { where: { id: req.user.id } });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  try {
    const user  = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(old_password, user.password);
    if (!match) return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });

    const hash = await bcrypt.hash(new_password, 10);
    await User.update({ password: hash }, { where: { id: req.user.id } });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { getMe, updateMe, changePassword };
