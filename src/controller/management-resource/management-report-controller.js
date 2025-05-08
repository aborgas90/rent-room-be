const {
  getAllReport,
  getByIdReport,
  actionReport,
} = require("../../services/management-resource/report-management-service");

const handleGetAllReport = async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  try {
    // Konversi page dan limit ke number
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Validasi pagination
    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getAllReport({
      status,
      page: pageNumber,
      limit: limitNumber,
    });

    return res.status(200).json({
      status: true,
      message: "Success get all report",
      data: result.data,
      totalData: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
const handleGetByIdReport = async (req, res, next) => {
  const { id } = req.params;
  const parseId = parseInt(id, 10);

  console.log(parseId, "parsed ID ");
  try {
    const getReport = await getByIdReport({ id: parseId });
    return res.status(200).json({
      status: true,
      message: "Success get by id report",
      data: getReport,
    });
  } catch (error) {
    next(error);
  }
};

const handleActionReport = async (req, res, next) => {
  const { id } = req.params;
  const parseId = parseInt(id, 10);

  try {
    const result = await actionReport({ id: parseId });
    return res.status(200).json({
      status: true,
      message: `Success update by id report on id ${id}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllReport,
  handleGetByIdReport,
  handleActionReport,
};
