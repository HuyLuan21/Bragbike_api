// src/models/peak_hour.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PeakHour = sequelize.define(
  "PeakHour",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50) },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    days_of_week: { type: DataTypes.STRING(20), defaultValue: "1,2,3,4,5" },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "peak_hours",
    timestamps: false,
  },
);

module.exports = PeakHour;
