const sequelize    = require('../config/db');
const User         = require('./user.model');
const Driver       = require('./driver.model');
const Ride         = require('./ride.model');
const Rating       = require('./rating.model');
const Report       = require('./report.model');
const Notification = require('./notification.model');

// ── Associations ──────────────────────────────────────────────

// User ↔ Driver (1:1)
User.hasOne(Driver,   { foreignKey: 'user_id', as: 'driverProfile' });
Driver.belongsTo(User,{ foreignKey: 'user_id', as: 'user' });

// User → Rides (1:N)
User.hasMany(Ride,  { foreignKey: 'user_id', as: 'rides' });
Ride.belongsTo(User,{ foreignKey: 'user_id', as: 'user' });

// Driver → Rides (1:N)
Driver.hasMany(Ride,  { foreignKey: 'driver_id', as: 'rides' });
Ride.belongsTo(Driver,{ foreignKey: 'driver_id', as: 'driver' });

// Ride → Rating (1:1)
Ride.hasOne(Rating,    { foreignKey: 'ride_id', as: 'rating' });
Rating.belongsTo(Ride, { foreignKey: 'ride_id', as: 'ride' });
User.hasMany(Rating,   { foreignKey: 'user_id', as: 'ratings' });
Driver.hasMany(Rating, { foreignKey: 'driver_id', as: 'ratings' });

// Ride → Reports (1:N)
Ride.hasMany(Report,     { foreignKey: 'ride_id',     as: 'reports' });
Report.belongsTo(Ride,   { foreignKey: 'ride_id',     as: 'ride' });
User.hasMany(Report,     { foreignKey: 'reporter_id', as: 'sentReports' });
Report.belongsTo(User,   { foreignKey: 'reporter_id', as: 'reporter' });
Driver.hasMany(Report,   { foreignKey: 'driver_id',   as: 'reports' });
Report.belongsTo(Driver, { foreignKey: 'driver_id',   as: 'driver' });

// User → Notifications (1:N)
User.hasMany(Notification,         { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User,       { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, Driver, Ride, Rating, Report, Notification };
