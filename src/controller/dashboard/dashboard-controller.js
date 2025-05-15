const {
  getIncomeThisMonth,
  getExpenseThisMonth,
  getFilledAndTotalRooms,
  getUserCount,
  getMonthlyTransactions,
  getLast5Payments,
} = require("../../services/dashboard/dashboard-services");

const handlerTotalIncomeThisMonth = async (req, res, next) => {
  try {
    const result = await getIncomeThisMonth();

    return res.status(200).json({
      status: true,
      message: "Get Income Data this month Successfull",
      data: result || [],
    });
  } catch (error) {
    next(error);
  }
};

const handlerTotalExpenseThisMonth = async (req, res, next) => {
  try {
    const result = await getExpenseThisMonth();

    return res.status(200).json({
      status: true,
      message: "Get Expense Data this month Successfull",
      data: result || [],
    });
  } catch (error) {
    next(error);
  }
};

const handlerCountRoomFullfill = async (req, res, next) => {
  try {
    const result = await getFilledAndTotalRooms();
    return res.status(200).json({
      status: true,
      message: "Get data room full fill successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handlerGetUserCount = async (req, res, next) => {
  try {
    const result = await getUserCount();

    return res.status(200).json({
      status: true,
      message: "Get User Data Successfull",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handlerGetAnnualyReportOfMonth = async (req, res, next) => {
  try {
    const result = await getMonthlyTransactions();

    return res.status(200).json({
      status: true,
      message: "Get Data Monthly Successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handlerGetLast5Payment = async (req, res, next) => {
  try {
    const result = await getLast5Payments();
    return res.status(200).json({
      status: true,
      message: "Get Last 5 Record of payemnt Successfull",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handlerTotalIncomeThisMonth,
  handlerTotalExpenseThisMonth,
  handlerCountRoomFullfill,
  handlerGetUserCount,
  handlerGetAnnualyReportOfMonth,
  handlerGetLast5Payment,
};
