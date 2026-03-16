const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ride_id:      { type: DataTypes.INTEGER, allowNull: false },
  reporter_id:  { type: DataTypes.INTEGER, allowNull: false },
  driver_id:    { type: DataTypes.INTEGER, allowNull: false },
  reason: {
    type: DataTypes.ENUM('RUDE_BEHAVIOR','WRONG_ROUTE','OVERCHARGE','UNSAFE_DRIVING','HARASSMENT','OTHER'),
    allowNull: false,
  },
  description:  { type: DataTypes.TEXT },
  evidence_url: { type: DataTypes.STRING(500) },
  status: {
    type: DataTypes.ENUM('PENDING','REVIEWED','ACTION_TAKEN','DISMISSED'),
    defaultValue: 'PENDING',
  },
  reviewed_by:  { type: DataTypes.INTEGER },
  reviewed_at:  { type: DataTypes.DATE },
  admin_note:   { type: DataTypes.TEXT },
}, {
  tableName:  'reports',
  timestamps: true,
  createdAt:  'created_at',
  updatedAt:  false,
});

module.exports = Report;
