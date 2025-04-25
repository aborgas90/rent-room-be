const prismaClient = require("../../prisma-client");

const getAllReport = async ({ status }) => {
  try {
    const report = await prismaClient.problemReport.findMany({
      where: {
        status: status,
      },
    });

    return report;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getByIdReport = async ({ id }) => {
  try {
    const findReport = await prismaClient.problemReport.findUnique({
      where: {
        id
      },
    });

    return findReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const actionReport = async({id}) => {
    try {
        const actionReport = await prismaClient.problemReport.update({
            where: {
              id: id
            },
            data: {
              status: 'DONE'
            },
            select: {
              id: true,
              filename: true,
              status: true,
              user_id: true,
              owner_name: true,
              room_number: true
            }
          })
          

        return actionReport
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = {
  getByIdReport,
  getAllReport,
  actionReport
};
