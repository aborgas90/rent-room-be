const prismaClient = require("../../../prisma-client");
const { sendEmail } = require("../../../utils/emailSender");
const { complaintEmail } = require("../../../utils/templates/complaintEmail");

const createReport = async ({
  user_id,
  title,
  fileUrl,
  description,
  category,
  owner_name,
}) => {
  const Room = await prismaClient.room.findUnique({
    where: { tenant_id: user_id },
  });

  const room_number = Room?.room_number || null;

  const report = await prismaClient.problemReport.create({
    data: {
      title,
      filename: fileUrl, // full GCS URL
      description,
      category,
      user_id,
      status: "PENDING",
      owner_name,
      room_number,
    },
  });

  return report;
};

const getReportUser = async ({ user_id }) => {
  try {
    const result = await prismaClient.problemReport.findMany({
      where: {
        user_id,
      },
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  createReport,
  getReportUser,
};
