const {
  createReportMoney,
  sumIncomeReport,
  sumExpenseReport,
  getAllTransactionPaymentPaid,
  getAllTransaction,
  editReportMoney,
  deleteReportMoney,
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

const handleEditReportMoneyTransaction = async (req, res, next) => {
  const { transaction_id } = req.params;
  const parseId = parseInt(transaction_id, 10);
  try {
    const { amount, type, category, description, transaction_date } = req.body;
    const result = await editReportMoney({
      transaction_id: parseId,
      amount,
      type,
      category,
      description,
      transaction_date,
    });

    return res.status(200).json({
      status: true,
      message: `Success edit report money`,
      data: result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const handleDeleteReportMoneyTransaction = async (req, res, next) => {
  const { transaction_id } = req.params;
  const parseId = parseInt(transaction_id, 10);
  try {
    const result = await deleteReportMoney({
      transaction_id: parseId,
    });

    return res.status(200).json({
      status: true,
      message: `Success delete report money`,
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

//buat yang udah bayar dan masukkan ke transasksi pemasukan
const handleGetAllTransaction = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const result = await getAllTransactionPaymentPaid({
      status,
      page,
      limit,
    });

    res.status(200).json(result); // result sudah termasuk data dan pagination
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

//buat  payment yang dah bayar
const handleGetAllTransactionTable = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const result = await getAllTransaction({ type, page, limit });
    res.status(200).json(result);
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
  handleGetAllTransactionTable,
  handleEditReportMoneyTransaction,
  handleDeleteReportMoneyTransaction,
};
