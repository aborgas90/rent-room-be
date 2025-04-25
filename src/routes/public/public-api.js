const express = require("express");
const {
  handleRegister,
  handleLogin,
} = require("../../controller/auth/auth-controller");
const {
  handlerMidtransNotification,
  handleGetTransactionOrderId,
} = require("../../controller/payment/payment-controller");
const publicApi = express.Router();

publicApi.post("/users/register", handleRegister);
publicApi.post("/users/login", handleLogin);
publicApi.post(
  "/payment/transaction-status/:orderId",
  handleGetTransactionOrderId
);
publicApi.post("/payment/notification", handlerMidtransNotification);

module.exports = publicApi;
