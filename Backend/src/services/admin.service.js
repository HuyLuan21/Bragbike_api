const {
  User,
  Driver,
  Report,
  Notification,
  Ride,
  DriverApplication,
  DriverLockHistory,
  DriverAppeal,
  VehiclePricing,
  PeakHour,
  RideStatusHistory,
} = require("../models");
const { Op } = require("sequelize");

// ═════════════════════════════════════════════════════════════
//  STATS
// ═════════════════════════════════════════════════════════════

const getStats = async () => {
  const [
    totalUsers,
    totalDrivers,
    totalRides,
    revenue,
    pendingReports,
    pendingAppeals,
    pendingApplications,
  ] = await Promise.all([
    User.count({ where: { role: "USER" } }),
    Driver.count(),
    Ride.count({ where: { status: "COMPLETED" } }),
    Ride.sum("total_price", { where: { status: "COMPLETED" } }),
    Report.count({ where: { status: "PENDING" } }),
    DriverAppeal.count({ where: { status: "PENDING" } }),
    DriverApplication.count({ where: { status: "PENDING" } }),
  ]);
  return {
    total_users: totalUsers,
    total_drivers: totalDrivers,
    total_rides: totalRides,
    total_revenue: revenue || 0,
    pending_reports: pendingReports,
    pending_appeals: pendingAppeals,
    pending_applications: pendingApplications,
  };
};

const getRideStats = async () => {
  const { sequelize } = require("../models");
  const [rows] = await sequelize.query(`
    SELECT
      DATE(created_at)                                                      AS date,
      COUNT(*)                                                              AS total,
      SUM(status = 'COMPLETED')                                             AS completed,
      SUM(status = 'CANCELLED')                                             AS cancelled,
      IFNULL(SUM(CASE WHEN status = 'COMPLETED' THEN total_price END), 0)  AS revenue
    FROM rides
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);
  return rows;
};

const getDriverStats = async () => {
  return Driver.findAll({
    attributes: ["id", "avg_rating", "total_trips", "is_online", "is_locked"],
    include: [{ model: User, as: "user", attributes: ["full_name", "phone"] }],
    order: [["total_trips", "DESC"]],
    limit: 20,
  });
};

// ═════════════════════════════════════════════════════════════
//  DRIVER APPLICATIONS
// ═════════════════════════════════════════════════════════════

const getDriverApplications = async (status = "PENDING") => {
  return DriverApplication.findAll({
    where: { status },
    include: [
      { model: User, as: "user", attributes: ["full_name", "phone", "email"] },
    ],
    order: [["submitted_at", "ASC"]],
  });
};

const getDriverApplicationById = async (id) => {
  const app = await DriverApplication.findByPk(id, {
    include: [
      { model: User, as: "user", attributes: ["full_name", "phone", "email"] },
    ],
  });
  if (!app) throw { status: 404, message: "Không tìm thấy đơn" };
  return app;
};

const approveDriverApplication = async (
  id,
  { vehicle_type, vehicle_name, license_plate },
  adminId,
) => {
  const app = await DriverApplication.findByPk(id);
  if (!app) throw { status: 404, message: "Không tìm thấy đơn" };
  if (app.status !== "PENDING")
    throw { status: 400, message: "Đơn đã được xử lý" };

  await app.update({
    status: "APPROVED",
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
  await Driver.create({
    user_id: app.user_id,
    vehicle_type,
    vehicle_name,
    license_plate,
  });
  await User.update({ role: "DRIVER" }, { where: { id: app.user_id } });
  await Notification.create({
    user_id: app.user_id,
    title: "Đơn đăng ký tài xế được duyệt",
    body: "Chúc mừng! Bạn đã trở thành tài xế BragBike.",
    type: "SYSTEM",
  });
};

const rejectDriverApplication = async (id, { rejection_reason }, adminId) => {
  if (!rejection_reason)
    throw { status: 400, message: "Cần cung cấp lý do từ chối" };

  const app = await DriverApplication.findByPk(id);
  if (!app) throw { status: 404, message: "Không tìm thấy đơn" };
  if (app.status !== "PENDING")
    throw { status: 400, message: "Đơn đã được xử lý" };

  await app.update({
    status: "REJECTED",
    rejection_reason,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
  await Notification.create({
    user_id: app.user_id,
    title: "Đơn đăng ký tài xế bị từ chối",
    body: `Lý do: ${rejection_reason}`,
    type: "SYSTEM",
  });
};

// ═════════════════════════════════════════════════════════════
//  DRIVERS
// ═════════════════════════════════════════════════════════════

const getAllDrivers = async ({ is_locked, is_online, search } = {}) => {
  const where = {};
  if (is_locked !== undefined) where.is_locked = is_locked === "true";
  if (is_online !== undefined) where.is_online = is_online === "true";

  const userWhere = {};
  if (search) userWhere.full_name = { [Op.like]: `%${search}%` };

  return Driver.findAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["full_name", "phone", "email"],
        where: userWhere,
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getDriverById = async (id) => {
  const driver = await Driver.findByPk(id, {
    include: [
      { model: User, as: "user", attributes: { exclude: ["password"] } },
    ],
  });
  if (!driver) throw { status: 404, message: "Không tìm thấy tài xế" };
  return driver;
};

const lockDriver = async (id, { reason, report_id }, adminId) => {
  if (!reason) throw { status: 400, message: "Cần cung cấp lý do khóa" };

  const driver = await Driver.findByPk(id);
  if (!driver) throw { status: 404, message: "Không tìm thấy tài xế" };
  if (driver.is_locked) throw { status: 400, message: "Tài xế đã bị khóa" };

  await driver.update({
    is_locked: true,
    locked_at: new Date(),
    locked_reason: reason,
  });
  await DriverLockHistory.create({
    driver_id: driver.id,
    locked_by: adminId,
    reason,
    report_id: report_id || null,
  });
  await Notification.create({
    user_id: driver.user_id,
    title: "Tài khoản bị tạm khóa",
    body: `Lý do: ${reason}`,
    type: "LOCK",
    ref_id: driver.id,
  });
};

const unlockDriver = async (id) => {
  const driver = await Driver.findByPk(id);
  if (!driver) throw { status: 404, message: "Không tìm thấy tài xế" };
  if (!driver.is_locked) throw { status: 400, message: "Tài xế không bị khóa" };

  await driver.update({
    is_locked: false,
    locked_at: null,
    locked_reason: null,
  });
  await DriverLockHistory.update(
    { unlocked_at: new Date() },
    { where: { driver_id: driver.id, unlocked_at: null } },
  );
  await Notification.create({
    user_id: driver.user_id,
    title: "Tài khoản đã được mở khóa",
    body: "Tài khoản tài xế của bạn đã được khôi phục.",
    type: "LOCK",
    ref_id: driver.id,
  });
};

// ═════════════════════════════════════════════════════════════
//  REPORTS
// ═════════════════════════════════════════════════════════════

const getPendingReports = async (status = "PENDING") => {
  return Report.findAll({
    where: { status },
    include: [
      { model: User, as: "reporter", attributes: ["full_name", "phone"] },
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user", attributes: ["full_name"] }],
      },
      {
        model: Ride,
        as: "ride",
        attributes: ["id", "pickup_address", "drop_address", "total_price"],
      },
    ],
    order: [["created_at", "ASC"]],
  });
};

const getReportById = async (id) => {
  const report = await Report.findByPk(id, {
    include: [
      { model: User, as: "reporter", attributes: ["full_name", "phone"] },
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user", attributes: ["full_name"] }],
      },
      { model: Ride, as: "ride" },
    ],
  });
  if (!report) throw { status: 404, message: "Không tìm thấy báo cáo" };
  return report;
};

const reviewReport = async (id, { status, admin_note }, adminId) => {
  const validStatuses = ["REVIEWED", "ACTION_TAKEN", "DISMISSED"];
  if (!validStatuses.includes(status)) {
    throw {
      status: 400,
      message: `status phải là: ${validStatuses.join(", ")}`,
    };
  }

  const report = await Report.findByPk(id);
  if (!report) throw { status: 404, message: "Không tìm thấy báo cáo" };

  await report.update({
    status,
    admin_note,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });
  await Notification.create({
    user_id: report.reporter_id,
    title: "Báo cáo của bạn đã được xử lý",
    body: `Trạng thái: ${status}. ${admin_note || ""}`.trim(),
    type: "REPORT",
    ref_id: report.id,
  });
};

// ═════════════════════════════════════════════════════════════
//  APPEALS
// ═════════════════════════════════════════════════════════════

const getPendingAppeals = async (status = "PENDING") => {
  return DriverAppeal.findAll({
    where: { status },
    include: [
      {
        model: Driver,
        as: "driver",
        include: [
          { model: User, as: "user", attributes: ["full_name", "phone"] },
        ],
      },
    ],
    order: [["created_at", "ASC"]],
  });
};

const getAppealById = async (id) => {
  const appeal = await DriverAppeal.findByPk(id, {
    include: [
      {
        model: Driver,
        as: "driver",
        include: [
          { model: User, as: "user", attributes: ["full_name", "phone"] },
        ],
      },
    ],
  });
  if (!appeal) throw { status: 404, message: "Không tìm thấy kháng cáo" };
  return appeal;
};

const approveAppeal = async (id, { admin_response }, adminId) => {
  const appeal = await DriverAppeal.findByPk(id);
  if (!appeal) throw { status: 404, message: "Không tìm thấy kháng cáo" };
  if (appeal.status !== "PENDING")
    throw { status: 400, message: "Kháng cáo đã được xử lý" };

  await appeal.update({
    status: "APPROVED",
    admin_response,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });

  const driver = await Driver.findByPk(appeal.driver_id);
  await driver.update({
    is_locked: false,
    locked_at: null,
    locked_reason: null,
  });
  await DriverLockHistory.update(
    { unlocked_at: new Date() },
    { where: { driver_id: appeal.driver_id, unlocked_at: null } },
  );
  await Notification.create({
    user_id: driver.user_id,
    title: "Kháng cáo được chấp nhận",
    body: admin_response || "Tài khoản của bạn đã được mở khóa.",
    type: "APPEAL",
    ref_id: appeal.id,
  });
};

const rejectAppeal = async (id, { admin_response }, adminId) => {
  if (!admin_response)
    throw { status: 400, message: "Cần cung cấp phản hồi từ chối" };

  const appeal = await DriverAppeal.findByPk(id);
  if (!appeal) throw { status: 404, message: "Không tìm thấy kháng cáo" };
  if (appeal.status !== "PENDING")
    throw { status: 400, message: "Kháng cáo đã được xử lý" };

  await appeal.update({
    status: "REJECTED",
    admin_response,
    reviewed_by: adminId,
    reviewed_at: new Date(),
  });

  const driver = await Driver.findByPk(appeal.driver_id);
  await Notification.create({
    user_id: driver.user_id,
    title: "Kháng cáo bị từ chối",
    body: admin_response,
    type: "APPEAL",
    ref_id: appeal.id,
  });
};

// ═════════════════════════════════════════════════════════════
//  PRICING
// ═════════════════════════════════════════════════════════════

const getAllPricing = async () => VehiclePricing.findAll();

const updatePricing = async (vehicleType, data) => {
  const pricing = await VehiclePricing.findOne({
    where: { vehicle_type: vehicleType },
  });
  if (!pricing) throw { status: 404, message: "Không tìm thấy loại xe" };
  return pricing.update(data);
};

// ═════════════════════════════════════════════════════════════
//  PEAK HOURS
// ═════════════════════════════════════════════════════════════

const getPeakHours = async () =>
  PeakHour.findAll({ order: [["start_time", "ASC"]] });

const createPeakHour = async (data) => PeakHour.create(data);

const updatePeakHour = async (id, data) => {
  const peak = await PeakHour.findByPk(id);
  if (!peak) throw { status: 404, message: "Không tìm thấy khung giờ" };
  return peak.update(data);
};

const deletePeakHour = async (id) => {
  const peak = await PeakHour.findByPk(id);
  if (!peak) throw { status: 404, message: "Không tìm thấy khung giờ" };
  await peak.destroy();
};

// ═════════════════════════════════════════════════════════════
//  USERS
// ═════════════════════════════════════════════════════════════

const getAllUsers = async ({ role, search, is_active } = {}) => {
  const where = {};
  if (role) where.role = role;
  if (is_active !== undefined) where.is_active = is_active === "true";
  if (search) where.full_name = { [Op.like]: `%${search}%` };

  return User.findAll({
    where,
    attributes: { exclude: ["password"] },
    order: [["created_at", "DESC"]],
  });
};

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };
  return user;
};

const deactivateUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };
  if (user.role === "ADMIN")
    throw { status: 403, message: "Không thể vô hiệu hóa admin" };
  await user.update({ is_active: false });
};

const activateUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };
  await user.update({ is_active: true });
};

// ═════════════════════════════════════════════════════════════
//  RIDES
// ═════════════════════════════════════════════════════════════

const getAllRides = async ({ status, date_from, date_to } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at[Op.gte] = new Date(date_from);
    if (date_to) where.created_at[Op.lte] = new Date(date_to);
  }
  return Ride.findAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["full_name", "phone"] },
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user", attributes: ["full_name"] }],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getRideById = async (id) => {
  const ride = await Ride.findByPk(id, {
    include: [
      { model: User, as: "user", attributes: ["full_name", "phone"] },
      {
        model: Driver,
        as: "driver",
        include: [{ model: User, as: "user", attributes: ["full_name"] }],
      },
      { model: RideStatusHistory, as: "statusHistory" },
    ],
  });
  if (!ride) throw { status: 404, message: "Không tìm thấy chuyến đi" };
  return ride;
};

module.exports = {
  // Stats
  getStats,
  getRideStats,
  getDriverStats,
  // Driver applications
  getDriverApplications,
  getDriverApplicationById,
  approveDriverApplication,
  rejectDriverApplication,
  // Drivers
  getAllDrivers,
  getDriverById,
  lockDriver,
  unlockDriver,
  // Reports
  getPendingReports,
  getReportById,
  reviewReport,
  // Appeals
  getPendingAppeals,
  getAppealById,
  approveAppeal,
  rejectAppeal,
  // Pricing
  getAllPricing,
  updatePricing,
  // Peak hours
  getPeakHours,
  createPeakHour,
  updatePeakHour,
  deletePeakHour,
  // Users
  getAllUsers,
  getUserById,
  deactivateUser,
  activateUser,
  // Rides
  getAllRides,
  getRideById,
};
