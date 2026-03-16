const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Driver = sequelize.define('Driver', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:       { type: DataTypes.INTEGER, allowNull: false, unique: true },
  vehicle_type:  { type: DataTypes.ENUM('MOTORBIKE','CAR_4','CAR_7'), allowNull: false },
  vehicle_name:  { type: DataTypes.STRING(100) },
  license_plate: { type: DataTypes.STRING(20), allowNull: false },
  is_online:     { type: DataTypes.BOOLEAN, defaultValue: false },
  is_locked:     { type: DataTypes.BOOLEAN, defaultValue: false },
  locked_at:     { type: DataTypes.DATE },
  locked_reason: { type: DataTypes.TEXT },
  lat:           { type: DataTypes.DECIMAL(10,7) },
  lng:           { type: DataTypes.DECIMAL(10,7) },
  avg_rating:    { type: DataTypes.DECIMAL(3,2), defaultValue: 5.00 },
  total_trips:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName:  'drivers',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = Driver;
