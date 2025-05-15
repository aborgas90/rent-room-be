const express = require("express");
const {
  authenticationMiddleware,
  authorizeRoles,
} = require("../../../middleware/middleware");
const {
  handlerTotalIncomeThisMonth,
  handlerTotalExpenseThisMonth,
  handlerCountRoomFullfill,
  handlerGetUserCount,
  handlerGetAnnualyReportOfMonth,
  handlerGetLast5Payment,
} = require("../../../controller/dashboard/dashboard-controller");

const dashboardApi = express.Router();

dashboardApi.get(
  "/dashboard/total-income-curmonth",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerTotalIncomeThisMonth
);

dashboardApi.get(
  "/dashboard/total-expense-curmonth",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerTotalExpenseThisMonth
);

dashboardApi.get(
  "/dashboard/full-fill-room",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerCountRoomFullfill
);

dashboardApi.get(
  "/dashboard/user/active",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerGetUserCount
);

dashboardApi.get(
  "/dashboard/report/monthly",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerGetAnnualyReportOfMonth
);

dashboardApi.get(
  "/dashboard/report/last-5-record",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerGetLast5Payment
);

module.exports = {
  dashboardApi,
};
