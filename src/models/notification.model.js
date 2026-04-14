const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    body: { type: DataTypes.TEXT },
    type: {
      type: DataTypes.ENUM("RIDE", "REPORT", "APPEAL", "LOCK", "SYSTEM"),
      defaultValue: "SYSTEM",
    },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    ref_id: { type: DataTypes.INTEGER },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Notification;
