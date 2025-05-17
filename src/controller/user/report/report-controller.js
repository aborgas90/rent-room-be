const { uploadFile } = require("../../../services/gcs/gcs-upload-service");
const {
  createReport,
  getReportUser,
} = require("../../../services/user/report/report-problem-service");

const handleCreateReport = async (req, res, next) => {
  const { title, description, category } = req.body;
  const { user_id, name } = req.user;

  try {
    let fileUrl = null;
    const { url } = await uploadFile(req.file); // ✅ ambil url langsung
    fileUrl = url;

    const report = await createReport({
      title,
      user_id: parseInt(user_id),
      fileUrl,
      description,
      category,
      owner_name: name,
    });

    return res.status(200).json({
      status: true,
      message: "Success to create report",
      data: report,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const handleGetReportProblem = async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const result = await getReportUser({ user_id });
    res.status(200).json({
      status: true,
      message: "Success to get all report problems",
      data: result || [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateReport,
  handleGetReportProblem,
};
