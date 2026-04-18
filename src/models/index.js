// src/models/index.js
const sequelize = require("../config/db");

const User = require("./user.model");
const Driver = require("./driver.model");
const DriverApplication = require("./driver_application.model ");
const DriverLockHistory = require("./driver_lock_history.model ");
const DriverAppeal = require("./driver_appeal.model ");
const Ride = require("./ride.model");
const RideStatusHistory = require("./Ride_status_history.model");
const Rating = require("./rating.model");
const Report = require("./report.model");
const Notification = require("./notification.model");
const VehiclePricing = require("./vehicle_pricing.model");
const PeakHour = require("./Peakhour.model");

// User ↔ Driver (1:1)
User.hasOne(Driver, { foreignKey: "user_id", as: "driverProfile" });
Driver.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User → DriverApplication (1:N)
User.hasMany(DriverApplication, { foreignKey: "user_id", as: "applications" });
DriverApplication.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Driver → DriverLockHistory (1:N)
Driver.hasMany(DriverLockHistory, {
  foreignKey: "driver_id",
  as: "lockHistory",
});
DriverLockHistory.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// Driver → DriverAppeal (1:N)
Driver.hasMany(DriverAppeal, { foreignKey: "driver_id", as: "appeals" });
DriverAppeal.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// DriverLockHistory → DriverAppeal (1:N)
DriverLockHistory.hasMany(DriverAppeal, {
  foreignKey: "lock_history_id",
  as: "appeals",
});
DriverAppeal.belongsTo(DriverLockHistory, {
  foreignKey: "lock_history_id",
  as: "lockHistory",
});

// User → Rides (1:N)
User.hasMany(Ride, { foreignKey: "user_id", as: "rides" });
Ride.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Driver → Rides (1:N)
Driver.hasMany(Ride, { foreignKey: "driver_id", as: "rides" });
Ride.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// Ride → RideStatusHistory (1:N)
Ride.hasMany(RideStatusHistory, { foreignKey: "ride_id", as: "statusHistory" });
RideStatusHistory.belongsTo(Ride, { foreignKey: "ride_id", as: "ride" });

// Ride → Rating (1:1)
Ride.hasOne(Rating, { foreignKey: "ride_id", as: "rating" });
Rating.belongsTo(Ride, { foreignKey: "ride_id", as: "ride" });
User.hasMany(Rating, { foreignKey: "user_id", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "user_id", as: "user" });
Driver.hasMany(Rating, { foreignKey: "driver_id", as: "ratings" });
Rating.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// Ride → Reports (1:N)
Ride.hasMany(Report, { foreignKey: "ride_id", as: "reports" });
Report.belongsTo(Ride, { foreignKey: "ride_id", as: "ride" });
User.hasMany(Report, { foreignKey: "reporter_id", as: "sentReports" });
Report.belongsTo(User, { foreignKey: "reporter_id", as: "reporter" });
Driver.hasMany(Report, { foreignKey: "driver_id", as: "reports" });
Report.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });

// User → Notifications (1:N)
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  sequelize,
  User,
  Driver,
  DriverApplication,
  DriverLockHistory,
  DriverAppeal,
  Ride,
  RideStatusHistory,
  Rating,
  Report,
  Notification,
  VehiclePricing,
  PeakHour,
};
