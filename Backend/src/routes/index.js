const { Router } = require("express");
const router = Router();

// ─────────────────────────────────────────────────────────────
//  Middlewares
// ─────────────────────────────────────────────────────────────
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const isAdmin = [verifyToken, requireRole("ADMIN")];

// ─────────────────────────────────────────────────────────────
//  Controllers
// ─────────────────────────────────────────────────────────────
const authCtrl = require("../controllers/auth.controller");
const userCtrl = require("../controllers/user.controller");
const driverCtrl = require("../controllers/driver.controller");
const rideCtrl = require("../controllers/ride.controller");
const ratingCtrl = require("../controllers/rating.controller");
const reportCtrl = require("../controllers/report.controller");
const notifCtrl = require("../controllers/notification.controller");
const adminCtrl = require("../controllers/admin.controller");
const pricingCtrl = require("../controllers/pricing.controller");
const appealCtrl = require("../controllers/appeal.controller");

// ═════════════════════════════════════════════════════════════
//  1. AUTH  —  /api/auth
// ═════════════════════════════════════════════════════════════
router.post("/auth/register", authCtrl.register); // đăng ký tài khoản
router.post("/auth/login", authCtrl.login); // đăng nhập → JWT
router.post("/auth/logout", verifyToken, authCtrl.logout); // đăng xuất
router.post("/auth/refresh-token", authCtrl.refreshToken); // làm mới access token

// ═════════════════════════════════════════════════════════════
//  2. USERS  —  /api/users
// ═════════════════════════════════════════════════════════════
router.get("/users/me", verifyToken, userCtrl.getMe); // xem thông tin bản thân
router.put("/users/me", verifyToken, userCtrl.updateMe); // cập nhật thông tin
router.put("/users/me/password", verifyToken, userCtrl.changePassword); // đổi mật khẩu
router.put("/users/me/avatar", verifyToken, userCtrl.updateAvatar); // cập nhật avatar

// ═════════════════════════════════════════════════════════════
//  3. DRIVERS  —  /api/drivers
// ═════════════════════════════════════════════════════════════
router.post("/drivers/apply", verifyToken, driverCtrl.applyDriver); // nộp đơn đăng ký tài xế
router.get("/drivers/me", verifyToken, driverCtrl.getMyProfile); // xem hồ sơ tài xế bản thân
router.get("/drivers/me/stats", verifyToken, driverCtrl.getMyStats); // tổng trips, rating, doanh thu
router.patch("/drivers/me/online", verifyToken, driverCtrl.toggleOnline); // bật/tắt trạng thái online
router.patch("/drivers/me/location", verifyToken, driverCtrl.updateLocation); // cập nhật GPS realtime
router.get(
  "/drivers/available-rides",
  verifyToken,
  driverCtrl.getAvailableRides,
); // chuyến đang SEARCHING gần tài xế
router.get("/drivers/me/history", verifyToken, driverCtrl.getMyRideHistory); // lịch sử chuyến của tài xế
router.get("/drivers/:id", driverCtrl.getDriverPublic); // public: hồ sơ công khai tài xế

// ═════════════════════════════════════════════════════════════
//  4. RIDES  —  /api/rides
// ═════════════════════════════════════════════════════════════
router.get("/rides/estimate", rideCtrl.estimateFare); // public: ước tính giá trước khi đặt
router.post("/rides", verifyToken, rideCtrl.createRide); // đặt xe → status SEARCHING
router.get("/rides/history", verifyToken, rideCtrl.getUserRideHistory); // lịch sử chuyến của user
router.get("/rides/:id", verifyToken, rideCtrl.getRideById); // chi tiết 1 chuyến
router.get(
  "/rides/:id/status-history",
  verifyToken,
  rideCtrl.getRideStatusHistory,
); // lịch sử thay đổi trạng thái

// Thay đổi trạng thái chuyến (tách riêng từng action cho dễ validate)
router.post("/rides/:id/accept", verifyToken, rideCtrl.acceptRide); // tài xế nhận   → DRIVER_ACCEPTED
router.post("/rides/:id/pickup", verifyToken, rideCtrl.pickupRide); // tài xế đến    → ARRIVED
router.post("/rides/:id/start", verifyToken, rideCtrl.startRide); // bắt đầu chạy  → IN_PROGRESS
router.post("/rides/:id/complete", verifyToken, rideCtrl.completeRide); // hoàn thành    → COMPLETED
router.post("/rides/:id/cancel", verifyToken, rideCtrl.cancelRide); // huỷ (USER/DRIVER/SYSTEM)

// ═════════════════════════════════════════════════════════════
//  5. RATINGS  —  /api/ratings
// ═════════════════════════════════════════════════════════════
router.post("/ratings", verifyToken, ratingCtrl.createRating); // đánh giá sau chuyến COMPLETED
router.get("/ratings/ride/:rideId", verifyToken, ratingCtrl.getRatingByRide); // đánh giá của 1 chuyến
router.get("/ratings/driver/:driverId", ratingCtrl.getDriverRatings); // public: tất cả rating của tài xế

// ═════════════════════════════════════════════════════════════
//  6. REPORTS  —  /api/reports
// ═════════════════════════════════════════════════════════════
router.post("/reports", verifyToken, reportCtrl.createReport); // tạo báo cáo vi phạm
router.get("/reports/me", verifyToken, reportCtrl.getMyReports); // xem báo cáo mình đã gửi
router.get("/reports/:id", verifyToken, reportCtrl.getReportById); // chi tiết 1 báo cáo

// ═════════════════════════════════════════════════════════════
//  7. NOTIFICATIONS  —  /api/notifications
// ═════════════════════════════════════════════════════════════
router.get("/notifications", verifyToken, notifCtrl.getMyNotifications); // danh sách thông báo (có phân trang)
router.get(
  "/notifications/unread-count",
  verifyToken,
  notifCtrl.getUnreadCount,
); // đếm số chưa đọc (badge)
router.patch("/notifications/read-all", verifyToken, notifCtrl.markAllAsRead); // đánh dấu tất cả đã đọc
router.patch("/notifications/:id/read", verifyToken, notifCtrl.markAsRead); // đánh dấu 1 thông báo đã đọc

// ═════════════════════════════════════════════════════════════
//  8. PRICING  —  /api/pricing  (public)
// ═════════════════════════════════════════════════════════════
router.get("/pricing", pricingCtrl.getAllPricing); // bảng giá tất cả loại xe
router.get("/pricing/peak-hours", pricingCtrl.getPeakHours); // danh sách giờ cao điểm
router.get("/pricing/:vehicleType", pricingCtrl.getPricingByType); // giá của 1 loại xe

// ═════════════════════════════════════════════════════════════
//  9. APPEALS  —  /api/appeals
// ═════════════════════════════════════════════════════════════
router.post("/appeals", verifyToken, appealCtrl.createAppeal); // tài xế tạo kháng cáo lệnh khóa
router.get("/appeals/me", verifyToken, appealCtrl.getMyAppeals); // xem kháng cáo bản thân
router.get("/appeals/:id", verifyToken, appealCtrl.getAppealById); // chi tiết 1 kháng cáo

// ═════════════════════════════════════════════════════════════
//  10. ADMIN  —  /api/admin  (verifyToken + role ADMIN)
// ═════════════════════════════════════════════════════════════

// Dashboard
router.get("/admin/stats", ...isAdmin, adminCtrl.getStats); // tổng quan: users, rides, doanh thu
router.get("/admin/stats/rides", ...isAdmin, adminCtrl.getRideStats); // thống kê chuyến theo ngày/tháng
router.get("/admin/stats/drivers", ...isAdmin, adminCtrl.getDriverStats); // hiệu suất tài xế

// Quản lý đơn đăng ký tài xế
router.get(
  "/admin/driver-applications",
  ...isAdmin,
  adminCtrl.getDriverApplications,
);
router.get(
  "/admin/driver-applications/:id",
  ...isAdmin,
  adminCtrl.getDriverApplicationById,
);
router.patch(
  "/admin/driver-applications/:id/approve",
  ...isAdmin,
  adminCtrl.approveDriverApplication,
); // duyệt → tạo record drivers
router.patch(
  "/admin/driver-applications/:id/reject",
  ...isAdmin,
  adminCtrl.rejectDriverApplication,
); // từ chối + lý do

// Quản lý tài xế
router.get("/admin/drivers", ...isAdmin, adminCtrl.getAllDrivers);
router.get("/admin/drivers/:id", ...isAdmin, adminCtrl.getDriverById);
router.post("/admin/drivers/:id/lock", ...isAdmin, adminCtrl.lockDriver); // khóa + lý do → ghi driver_lock_history
router.post("/admin/drivers/:id/unlock", ...isAdmin, adminCtrl.unlockDriver); // mở khóa

// Quản lý báo cáo vi phạm
router.get("/admin/reports", ...isAdmin, adminCtrl.getPendingReports); // lọc theo status
router.get("/admin/reports/:id", ...isAdmin, adminCtrl.getReportById);
router.patch("/admin/reports/:id/review", ...isAdmin, adminCtrl.reviewReport); // xử lý + ghi admin_note

// Quản lý kháng cáo
router.get("/admin/appeals", ...isAdmin, adminCtrl.getPendingAppeals);
router.get("/admin/appeals/:id", ...isAdmin, adminCtrl.getAppealById);
router.patch("/admin/appeals/:id/approve", ...isAdmin, adminCtrl.approveAppeal); // chấp nhận → tự động mở khóa tài xế
router.patch("/admin/appeals/:id/reject", ...isAdmin, adminCtrl.rejectAppeal); // từ chối + phản hồi

// Quản lý bảng giá
router.get("/admin/pricing", ...isAdmin, adminCtrl.getAllPricing);
router.put("/admin/pricing/:vehicleType", ...isAdmin, adminCtrl.updatePricing); // cập nhật giá

// Quản lý giờ cao điểm
router.get("/admin/peak-hours", ...isAdmin, adminCtrl.getPeakHours);
router.post("/admin/peak-hours", ...isAdmin, adminCtrl.createPeakHour);
router.put("/admin/peak-hours/:id", ...isAdmin, adminCtrl.updatePeakHour);
router.delete("/admin/peak-hours/:id", ...isAdmin, adminCtrl.deletePeakHour);

// Quản lý users
router.get("/admin/users", ...isAdmin, adminCtrl.getAllUsers);
router.get("/admin/users/:id", ...isAdmin, adminCtrl.getUserById);
router.patch(
  "/admin/users/:id/deactivate",
  ...isAdmin,
  adminCtrl.deactivateUser,
); // vô hiệu hóa tài khoản
router.patch("/admin/users/:id/activate", ...isAdmin, adminCtrl.activateUser); // kích hoạt lại

// Quản lý chuyến đi
router.get("/admin/rides", ...isAdmin, adminCtrl.getAllRides); // lọc theo status, ngày, tài xế, user
router.get("/admin/rides/:id", ...isAdmin, adminCtrl.getRideById);

module.exports = router;
