const express = require("express");
const {
  handleRegister,
  handleLogin,
  handleLogout,
  handleForgetPassword,
  handleResetPassword,
} = require("../../controller/auth/auth-controller");
const {
  handlerMidtransNotification,
  handleGetTransactionOrderId,
} = require("../../controller/payment/payment-controller");
const {
  handleGetAllRoomPublic,
} = require("../../controller/management-resource/management-room-controller");
const publicApi = express.Router();

publicApi.post("/auth/register", handleRegister);
publicApi.post("/auth/login", handleLogin);
publicApi.post("/auth/logout", handleLogout);
publicApi.post("/auth/forgot-password", handleForgetPassword);
publicApi.post("/auth/reset-password", handleResetPassword);

publicApi.post(
  "/payment/transaction-status/:orderId",
  handleGetTransactionOrderId
);
publicApi.post("/payment/notification", handlerMidtransNotification);
//get all room on public
publicApi.get("/list-rooms", handleGetAllRoomPublic);

module.exports = publicApi;
