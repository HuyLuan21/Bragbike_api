// src/models/ride_status_history.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RideStatusHistory = sequelize.define(
  "RideStatusHistory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ride_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
    note: { type: DataTypes.TEXT },
    changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "ride_status_history",
    timestamps: false,
  },
);

module.exports = RideStatusHistory;
