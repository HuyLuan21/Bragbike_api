const createError = require("http-errors");

const AppError = {
  // Auth
  invalidCredentials: () => createError(401, "Sai email hoặc mật khẩu!"),
  accountNotFound: () => createError(404, "Không tìm thấy tài khoản"),
  unauthorized: () => createError(401, "Bạn chưa đăng nhập"),
  forbidden: () => createError(403, "Bạn không có quyền thực hiện"),
  emailAlreadyExists: () => createError(409, "Email đã được sử dụng"), // ← đăng ký trùng email

  // Token
  invalidToken: () => createError(400, "Token không hợp lệ hoặc đã hết hạn"),
  tokenExpired: () => createError(401, "Phiên đăng nhập đã hết hạn"), // ← JWT hết hạn

  // General
  notFound: (name = "Tài nguyên") => createError(404, `${name} không tồn tại`),
  badRequest: (msg = "Yêu cầu không hợp lệ") => createError(400, msg),
  internal: () => createError(500, "Lỗi hệ thống, vui lòng thử lại"),
  tooManyRequests: () => createError(429, "Quá nhiều yêu cầu, thử lại sau"), // ← rate limit
};

module.exports = AppError;
