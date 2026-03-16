const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");
const globalError = require("./Errors/globalError");
const socketConfig = require("./config/socket");
const { connectRedis } = require("./config/redis"); // ← import từ redis.js
const logger = require("./config/logger");

const app = express();
const server = http.createServer(app);

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES =====
app.use("/api", require("./routes"));

// ===== HEALTH CHECK =====
app.get("/health", (req, res) =>
  res.json({ status: "🚗 BragBike API running" }),
);

// ===== GLOBAL ERROR =====
globalError(app);

// ===== SOCKET =====
socketConfig(server);

// ===== KHỞI ĐỘNG =====
const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    logger.info("✅ Database connected");
    return sequelize.sync({ force: false });
  })
  .then(() => connectRedis()) // ← gọi connectRedis
  .then(() => {
    server.listen(PORT, () =>
      logger.info(`🚗 BragBike API chạy tại http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    logger.error("❌ Khởi động thất bại:", err.message);
    process.exit(1);
  });

module.exports = { app, server };
