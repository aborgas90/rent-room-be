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
  handleGetIdRoomBooking,
  handlerGetBookingStatus,
  handlerGetPaymentStatusLast,
  handlerGetInvoice,
} = require("../../controller/payment/payment-controller");
const upload = require("../../config/multer.config");
const {
  handlerRequestBookRoom,
  handlerGetAllRequestBook,
  handleActionApproveRequestBook,
  handleActionRejectRequestBook,
  handlerGetApprovedBookingDetail,
  handlerGetRequestBookPending,
} = require("../../controller/payment/request-book-room/request-book-controller");
const { user } = require("../../prisma-client");
const {
  handlerGetTransactionPaymentOnUser,
} = require("../../controller/user/transaction/transaction-controller");
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
  authorizeRoles("member", "super_admin", "admin", "out_member"),
  handleGetReportProblem
);

userApi.post(
  "/payment/create",
  authenticationMiddleware,
  authorizeRoles("member", "super_admin"),
  handlerCreatePayment
);

//booking request
userApi.post(
  "/booking-request/create",
  authenticationMiddleware,
  authorizeRoles("out_member", "super_admin"),
  handlerRequestBookRoom
);

userApi.get(
  "/booking-request/list",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerGetAllRequestBook
);

userApi.get(
  "/booking-list/pending-approval",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handlerGetRequestBookPending
);

userApi.post(
  "/booking-request/approve/:request_id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleActionApproveRequestBook
);

userApi.post(
  "/booking-request/reject/:request_id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin"),
  handleActionRejectRequestBook
);

userApi.get(
  "/booking-room/room/:id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin", "member", "out_member"),
  handleGetIdRoomBooking
);

userApi.get(
  "/booking-room/status/:room_id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin", "out_member"),
  handlerGetBookingStatus
);

userApi.get(
  "/request-book/booking-info/:room_id",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin", "member", "out_member"),
  handlerGetApprovedBookingDetail
);

userApi.get(
  "/transaction-history/user",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin", "member", "out_member"),
  handlerGetTransactionPaymentOnUser
);

userApi.get(
  "/payment/last-status",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin", "member", "out_member"),
  handlerGetPaymentStatusLast
);

userApi.get(
  "/payment/invoice/:orderId",
  authenticationMiddleware,
  authorizeRoles("super_admin", "admin", "member", "out_member"),
  handlerGetInvoice
);
module.exports = {
  userApi,
};
