// src/models/driver_lock_history.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DriverLockHistory = sequelize.define(
  "DriverLockHistory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    driver_id: { type: DataTypes.INTEGER, allowNull: false },
    locked_by: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT },
    report_id: { type: DataTypes.INTEGER },
    locked_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    unlocked_at: { type: DataTypes.DATE },
  },
  {
    tableName: "driver_lock_history",
    timestamps: false,
  },
);

module.exports = DriverLockHistory;
