const express = require("express");
const {
  authenticationMiddleware,
  authorizeRoles,
} = require("../../middleware/middleware");
const {
  handleFindIdUser,
  handleGetAllDataUser,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleFindIdAdmin,
  handleGetAllDataAdmin,
  handleCreateAdmin,
  handleDeleteAdmin,
  handleUpdateAdmin,
} = require("../../controller/management-resource/management-user-controller");
const {
  handleCreateRoom,
  handleGetAllRoom,
  handleGetIdRoom,
  handleUpdateRoom,
  handleDeleteRoom,
} = require("../../controller/management-resource/management-room-controller");
const {
  handleGetAllReport,
  handleGetByIdReport,
  handleActionReport,
} = require("../../controller/management-resource/management-report-controller");
const {
  handleReportMoney,
  handleGetAllTransaction,
  handleGetExpenseReport,
  handleGetIncomeReport,
} = require("../../controller/management-resource/money-report-management-controller");
const managementApi = express.Router();

// user management dengan param roles
managementApi.get(
  "/management/user",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllDataUser
);
managementApi.get(
  "/management/user/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleFindIdUser
);
managementApi.post(
  "/management/user/create",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleCreateUser
);
managementApi.put(
  "/management/user/update/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleUpdateUser
);
managementApi.delete(
  "/management/user/delete/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleDeleteUser
);

//admin management
managementApi.get(
  "/management/admin",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllDataAdmin
);
managementApi.get(
  "/management/admin/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleFindIdAdmin
);
managementApi.post(
  "/management/admin/create",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleCreateAdmin
);
managementApi.put(
  "/management/admin/update/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleUpdateAdmin
);
managementApi.delete(
  "/management/admin/delete/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleDeleteAdmin
);

//room
managementApi.post(
  "/management/rooms/create",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleCreateRoom
);

managementApi.get(
  "/management/rooms",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllRoom
);

managementApi.get(
  "/management/rooms/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetIdRoom
);

managementApi.put(
  "/management/rooms/update:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleUpdateRoom
);

managementApi.delete(
  "/management/rooms/delete/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleDeleteRoom
);

//report problem
managementApi.get(
  "/management/report-problem",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllReport
);

managementApi.get(
  "/management/report-problem/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetByIdReport
);

managementApi.put(
  "/management/report-problem/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleActionReport
);

//report money
managementApi.post(
  "/management/report-money/create",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleReportMoney
);

managementApi.get(
  "/management/report-money/income",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetIncomeReport
);

managementApi.get(
  "/management/report-money/expense",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetExpenseReport
);

managementApi.get(
  "/management/list-payment",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllTransaction
)

module.exports = managementApi;
