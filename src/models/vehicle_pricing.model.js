// src/models/vehicle_pricing.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VehiclePricing = sequelize.define('VehiclePricing', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_type:         { type: DataTypes.ENUM('MOTORBIKE','CAR_4','CAR_7'), allowNull: false, unique: true },
  label:                { type: DataTypes.STRING(50) },
  base_fare:            { type: DataTypes.DECIMAL(10,2), allowNull: false },
  price_per_km:         { type: DataTypes.DECIMAL(10,2), allowNull: false },
  peak_hour_multiplier: { type: DataTypes.DECIMAL(3,2), defaultValue: 1.50 },
  min_fare:             { type: DataTypes.DECIMAL(10,2), allowNull: false },
}, {
  tableName: 'vehicle_pricing',
  timestamps: false,
});

module.exports = VehiclePricing;