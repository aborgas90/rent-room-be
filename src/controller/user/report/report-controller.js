const {
  getAllTransactionPaymentPaid,
} = require("../../../services/management-resource/money-report-management-service");
const {
  createReport,
  sumIncomeReport,
  getReportUser,
} = require("../../../services/user/report/report-problem-service");

const handleCreateReport = async (req, res, next) => {
  const { user_id, name } = req.user;
  const parseId = parseInt(user_id, 10);
  const { title, description, category } = req.body;
  const filename = req.file?.filename || null; // ✅ safe even if no file uploaded

  try {
    const result = await createReport({
      title,
      user_id: parseId,
      filename,
      description,
      category,
      owner_name: name,
    });

    return res.status(200).json({
      status: true,
      message: "Success to create report",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handleGetReportProblem = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    console.log(user_id, "user Report");

    const result = await getReportUser({ user_id });
    res.status(200).json({
      status: true,
      message: "Success to get all report problems",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateReport,
  handleGetReportProblem,
};
