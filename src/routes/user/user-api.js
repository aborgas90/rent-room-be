const express = require("express");
const {
  authenticationMiddleware,
  authorizeRoles,
} = require("../../middleware/middleware");
const {
  handleCreateReport,
  handleGetReportProblem,
} = require("../../controller/user/report/report-controller");
const {
  handlerCreatePayment,
} = require("../../controller/payment/payment-controller");
const upload = require("../../config/multer.config");
const userApi = express.Router();

userApi.post(
  "/report-problem/create",
  upload.single("filename"),
  authenticationMiddleware,
  authorizeRoles("member", "super_admin", "admin"),
  handleCreateReport
);

userApi.get(
  "/list-report-problem/",
  authenticationMiddleware,
  authorizeRoles("member", "super_admin", "admin"),
  handleGetReportProblem
);

userApi.post(
  "/payment/create",
  authenticationMiddleware,
  authorizeRoles("member"),
  handlerCreatePayment
);

module.exports = {
  userApi,
};
