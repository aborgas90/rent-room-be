const {
  getTransactionPaymentOnUser,
} = require("../../../services/user/transaction/report-transaction-service");

const handlerGetTransactionPaymentOnUser = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const result = await getTransactionPaymentOnUser(parseInt(user_id, 10));

    return res.status(200).json({
      status: true,
      message: "Success to Get Transaction Payment Data",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    handlerGetTransactionPaymentOnUser
}
