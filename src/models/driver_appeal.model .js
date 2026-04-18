// src/models/driver_appeal.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DriverAppeal = sequelize.define(
  "DriverAppeal",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    driver_id: { type: DataTypes.INTEGER, allowNull: false },
    lock_history_id: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    evidence_url: { type: DataTypes.STRING(500) },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
    reviewed_by: { type: DataTypes.INTEGER },
    reviewed_at: { type: DataTypes.DATE },
    admin_response: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "driver_appeals",
    timestamps: false,
  },
);

module.exports = DriverAppeal;
