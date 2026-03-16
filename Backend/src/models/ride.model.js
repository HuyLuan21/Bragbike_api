const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ride = sequelize.define('Ride', {
  id:                    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:               { type: DataTypes.INTEGER, allowNull: false },
  driver_id:             { type: DataTypes.INTEGER },
  vehicle_type:          { type: DataTypes.ENUM('MOTORBIKE','CAR_4','CAR_7'), allowNull: false },
  pickup_address:        { type: DataTypes.TEXT },
  pickup_lat:            { type: DataTypes.DECIMAL(10,7), allowNull: false },
  pickup_lng:            { type: DataTypes.DECIMAL(10,7), allowNull: false },
  drop_address:          { type: DataTypes.TEXT },
  drop_lat:              { type: DataTypes.DECIMAL(10,7), allowNull: false },
  drop_lng:              { type: DataTypes.DECIMAL(10,7), allowNull: false },
  distance_km:           { type: DataTypes.DECIMAL(8,2) },
  estimated_duration_min:{ type: DataTypes.INTEGER },
  route_polyline:        { type: DataTypes.TEXT },
  base_fare:             { type: DataTypes.DECIMAL(10,2) },
  distance_fare:         { type: DataTypes.DECIMAL(10,2) },
  peak_hour_surcharge:   { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  total_price:           { type: DataTypes.DECIMAL(10,2) },
  is_peak_hour:          { type: DataTypes.BOOLEAN, defaultValue: false },
  status: {
    type: DataTypes.ENUM('SEARCHING','DRIVER_ACCEPTED','ON_THE_WAY','ARRIVED','IN_PROGRESS','COMPLETED','CANCELLED'),
    defaultValue: 'SEARCHING',
  },
  cancelled_by:  { type: DataTypes.ENUM('USER','DRIVER','SYSTEM') },
  cancel_reason: { type: DataTypes.TEXT },
  started_at:    { type: DataTypes.DATE },
  completed_at:  { type: DataTypes.DATE },
}, {
  tableName:  'rides',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  'updated_at',
});

module.exports = Ride;
