const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Rating = sequelize.define(
  "Rating",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ride_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    driver_id: { type: DataTypes.INTEGER, allowNull: false },
    stars: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT },
  },
  {
    tableName: "ratings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = Rating;
