const adminService = require("../services/admin.service");

// Helper: bắt lỗi từ service (service throw { status, message })
const handle = (fn) => async (req, res) => {
  try {
    const result = await fn(req, res);
    if (result !== undefined) res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Lỗi server" });
  }
};

// ─────────────────────────────────────────
//  STATS
// ─────────────────────────────────────────
const getStats = handle(async (req, res) => {
  return adminService.getStats();
});

const getRideStats = handle(async (req, res) => {
  return adminService.getRideStats();
});

const getDriverStats = handle(async (req, res) => {
  return adminService.getDriverStats();
});

// ─────────────────────────────────────────
//  DRIVER APPLICATIONS
// ─────────────────────────────────────────
const getDriverApplications = handle(async (req, res) => {
  return adminService.getDriverApplications(req.query.status);
});

const getDriverApplicationById = handle(async (req, res) => {
  return adminService.getDriverApplicationById(req.params.id);
});

const approveDriverApplication = handle(async (req, res) => {
  await adminService.approveDriverApplication(
    req.params.id,
    req.body,
    req.user.id,
  );
  res.json({ message: "Đã duyệt đơn, tài khoản tài xế đã được tạo" });
});

const rejectDriverApplication = handle(async (req, res) => {
  await adminService.rejectDriverApplication(
    req.params.id,
    req.body,
    req.user.id,
  );
  res.json({ message: "Đã từ chối đơn" });
});

// Alias giữ tương thích route cũ PATCH /driver-applications/:id
const reviewDriverApplication = handle(async (req, res) => {
  const { status } = req.body;
  if (status === "APPROVED") {
    await adminService.approveDriverApplication(
      req.params.id,
      req.body,
      req.user.id,
    );
    res.json({ message: "Đã duyệt đơn" });
  } else if (status === "REJECTED") {
    await adminService.rejectDriverApplication(
      req.params.id,
      req.body,
      req.user.id,
    );
    res.json({ message: "Đã từ chối đơn" });
  } else {
    res.status(400).json({ message: "status phải là APPROVED hoặc REJECTED" });
  }
});

// ─────────────────────────────────────────
//  DRIVERS
// ─────────────────────────────────────────
const getAllDrivers = handle(async (req, res) => {
  return adminService.getAllDrivers(req.query);
});

const getDriverById = handle(async (req, res) => {
  return adminService.getDriverById(req.params.id);
});

const lockDriver = handle(async (req, res) => {
  await adminService.lockDriver(req.params.id, req.body, req.user.id);
  res.json({ message: "Đã khóa tài xế" });
});

const unlockDriver = handle(async (req, res) => {
  await adminService.unlockDriver(req.params.id);
  res.json({ message: "Đã mở khóa tài xế" });
});

// ─────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────
const getPendingReports = handle(async (req, res) => {
  return adminService.getPendingReports(req.query.status);
});

const getReportById = handle(async (req, res) => {
  return adminService.getReportById(req.params.id);
});

const reviewReport = handle(async (req, res) => {
  await adminService.reviewReport(req.params.id, req.body, req.user.id);
  res.json({ message: "Đã xử lý báo cáo" });
});

// ─────────────────────────────────────────
//  APPEALS
// ─────────────────────────────────────────
const getPendingAppeals = handle(async (req, res) => {
  return adminService.getPendingAppeals(req.query.status);
});

const getAppealById = handle(async (req, res) => {
  return adminService.getAppealById(req.params.id);
});

const approveAppeal = handle(async (req, res) => {
  await adminService.approveAppeal(req.params.id, req.body, req.user.id);
  res.json({ message: "Đã chấp nhận kháng cáo, tài xế được mở khóa" });
});

const rejectAppeal = handle(async (req, res) => {
  await adminService.rejectAppeal(req.params.id, req.body, req.user.id);
  res.json({ message: "Đã từ chối kháng cáo" });
});

// Alias route cũ PATCH /appeals/:id
const reviewAppeal = handle(async (req, res) => {
  const { status } = req.body;
  if (status === "APPROVED") {
    await adminService.approveAppeal(req.params.id, req.body, req.user.id);
    res.json({ message: "Đã chấp nhận kháng cáo" });
  } else if (status === "REJECTED") {
    await adminService.rejectAppeal(req.params.id, req.body, req.user.id);
    res.json({ message: "Đã từ chối kháng cáo" });
  } else {
    res.status(400).json({ message: "status phải là APPROVED hoặc REJECTED" });
  }
});

// ─────────────────────────────────────────
//  PRICING
// ─────────────────────────────────────────
const getAllPricing = handle(async (req, res) => {
  return adminService.getAllPricing();
});

const updatePricing = handle(async (req, res) => {
  const data = await adminService.updatePricing(
    req.params.vehicleType,
    req.body,
  );
  res.json({ message: "Đã cập nhật bảng giá", data });
});

// ─────────────────────────────────────────
//  PEAK HOURS
// ─────────────────────────────────────────
const getPeakHours = handle(async (req, res) => {
  return adminService.getPeakHours();
});

const createPeakHour = handle(async (req, res) => {
  const peak = await adminService.createPeakHour(req.body);
  res.status(201).json(peak);
});

const updatePeakHour = handle(async (req, res) => {
  return adminService.updatePeakHour(req.params.id, req.body);
});

const deletePeakHour = handle(async (req, res) => {
  await adminService.deletePeakHour(req.params.id);
  res.json({ message: "Đã xóa khung giờ cao điểm" });
});

// ─────────────────────────────────────────
//  USERS
// ─────────────────────────────────────────
const getAllUsers = handle(async (req, res) => {
  return adminService.getAllUsers(req.query);
});

const getUserById = handle(async (req, res) => {
  return adminService.getUserById(req.params.id);
});

const deactivateUser = handle(async (req, res) => {
  await adminService.deactivateUser(req.params.id);
  res.json({ message: "Đã vô hiệu hóa tài khoản" });
});

const activateUser = handle(async (req, res) => {
  await adminService.activateUser(req.params.id);
  res.json({ message: "Đã kích hoạt lại tài khoản" });
});

// ─────────────────────────────────────────
//  RIDES
// ─────────────────────────────────────────
const getAllRides = handle(async (req, res) => {
  return adminService.getAllRides(req.query);
});

const getRideById = handle(async (req, res) => {
  return adminService.getRideById(req.params.id);
});

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
  reviewDriverApplication,
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
  reviewAppeal,
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
