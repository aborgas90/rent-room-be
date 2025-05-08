const prismaClient = require("../../../prisma-client");

const createReport = async ({
  user_id,
  title,
  filename,
  description,
  category,
  owner_name,
}) => {
  try {
    const Room = await prismaClient.room.findUnique({
      where: {
        tenant_id: user_id,
      },
    });

    const room_number = Room?.room_number || null;

    const actionReport = await prismaClient.problemReport.create({
      data: {
        title,
        filename: `uploads/image/${filename}` || null,
        description,
        category,
        user_id,
        status: "PENDING",
        owner_name,
        room_number: room_number,
      },
    });

    return actionReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
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
