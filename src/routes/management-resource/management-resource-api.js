const express = require("express");
const {
  authenticationMiddleware,
  authorizeRoles,
} = require("../../middleware/middleware");
const {
  handleFindIdUser,
  handleGetAllDataUserMember,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleFindIdAdmin,
  handleGetAllDataAdmin,
  handleCreateAdmin,
  handleDeleteAdmin,
  handleUpdateAdmin,
  handleGetAllUsersQuery,
  handleResetPassword,
} = require("../../controller/management-resource/management-user-controller");
const {
  handleCreateRoom,
  handleGetAllRoom,
  handleGetIdRoom,
  handleUpdateRoom,
  handleDeleteRoom,
  handleGetAllFacilities,
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
  handleGetAllTransactionTable,
  handleEditReportMoneyTransaction,
  handleDeleteReportMoneyTransaction,
} = require("../../controller/management-resource/money-report-management-controller");
const managementApi = express.Router();

//user management filtering
managementApi.get(
  "/management/user",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllUsersQuery
);
// user management dengan param roles
managementApi.get(
  "/management/user-member",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllDataUserMember
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

managementApi.put(
  "/management/user/reset-password/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleResetPassword
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
  "/management/rooms/update/:id",
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

managementApi.put(
  "/management/report-money/update/:transaction_id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleEditReportMoneyTransaction
);

managementApi.delete(
  "/management/report-money/delete/:transaction_id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleDeleteReportMoneyTransaction
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
);

//facisility
managementApi.get(
  "/management/facility",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllFacilities
);

managementApi.get(
  "/management/report-money/transaction",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleGetAllTransactionTable
);

module.exports = managementApi;
