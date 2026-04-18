// src/models/driver_application.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DriverApplication = sequelize.define(
  "DriverApplication",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    id_card_number: { type: DataTypes.STRING(20), allowNull: false },
    id_card_front_url: { type: DataTypes.STRING(500) },
    id_card_back_url: { type: DataTypes.STRING(500) },
    driver_license_number: { type: DataTypes.STRING(30), allowNull: false },
    driver_license_url: { type: DataTypes.STRING(500) },
    vehicle_registration_url: { type: DataTypes.STRING(500) },
    vehicle_insurance_url: { type: DataTypes.STRING(500) },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
    },
    rejection_reason: { type: DataTypes.TEXT },
    reviewed_by: { type: DataTypes.INTEGER },
    reviewed_at: { type: DataTypes.DATE },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "driver_applications",
    timestamps: false,
  },
);

module.exports = DriverApplication;
