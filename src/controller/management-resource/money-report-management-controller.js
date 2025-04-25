const {
  createReportMoney,
  sumIncomeReport,
  sumExpenseReport,
  getAllTransactionPaymentPaid,
} = require("../../services/management-resource/money-report-management-service");

const handleReportMoney = async (req, res, next) => {
  const { user_id } = req.user;
  console.log(user_id, "id nya apa");
  const parseId = parseInt(user_id, 10);
  const { amount, type, category, description, transaction_date } = req.body;
  try {
    const result = await createReportMoney({
      parseId,
      amount,
      type,
      category,
      description,
      transaction_date,
    });

    return res.status(200).json({
      status: true,
      message: `Success create report money`,
      data: result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const handleGetIncomeReport = async (req, res, next) => {
  try {
    const result = await sumIncomeReport();

    res.status(200).json({ totalIncome: result });
  } catch (error) {
    console.error("🚨 Error handler get Income Report:", error.message);
    res.status(500).json({
      status_code: 500,
      message: "Gagal memproses notifikasi",
      error: error.message,
    });
    next(error);
  }
};

const handleGetExpenseReport = async (req, res, next) => {
  try {
    const result = await sumExpenseReport();

    res.status(200).json({ totalIncome: result });
  } catch (error) {
    console.error("🚨 Error handler get Income Report:", error.message);
    res.status(500).json({
      status_code: 500,
      message: "Gagal memproses notifikasi",
      error: error.message,
    });
    next(error);
  }
};

const handleGetAllTransaction = async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await getAllTransactionPaymentPaid({ status });
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("🚨 Error handler get Income Report:", error.message);
    res.status(500).json({
      status_code: 500,
      message: "Gagal memproses data transaction",
      error: error.message,
    });
    next(error);
  }
};

module.exports = {
  handleReportMoney,
  handleGetAllTransaction,
  handleGetExpenseReport,
  handleGetIncomeReport,
};
