const express    = require('express');
const cors       = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.route'));
app.use('/api/users',         require('./routes/user.route'));
app.use('/api/drivers',       require('./routes/driver.route'));
app.use('/api/rides',         require('./routes/ride.route'));
app.use('/api/ratings',       require('./routes/rating.route'));
app.use('/api/reports',       require('./routes/report.route'));
app.use('/api/notifications', require('./routes/notification.route'));
app.use('/api/admin',         require('./routes/admin.route'));

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: '🚗 BragBike API running' }));

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Endpoint không tồn tại' }));

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Kết nối database thành công');
    // sync({ force: false }) chỉ tạo bảng nếu chưa có, KHÔNG xoá dữ liệu
    return sequelize.sync({ force: false });
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚗 BragBike API chạy tại http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối database:', err.message);
    process.exit(1);
  });
