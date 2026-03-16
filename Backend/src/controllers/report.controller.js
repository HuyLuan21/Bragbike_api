// src/controllers/report.controller.js
const reportService = require("../services/report.service");

const createReport = async (req, res, next) => {
  try {
    await reportService.createReport(req.user.id, req.body);
    res
      .status(201)
      .json({ message: "Gửi tố cáo thành công, admin sẽ xem xét" });
  } catch (e) {
    next(e);
  }
};
const getMyReports = async (req, res, next) => {
  try {
    res.json(await reportService.getMyReports(req.user.id));
  } catch (e) {
    next(e);
  }
};
const getReportById = async (req, res, next) => {
  try {
    res.json(await reportService.getReportById(req.user.id, req.params.id));
  } catch (e) {
    next(e);
  }
};

module.exports = { createReport, getMyReports, getReportById };
