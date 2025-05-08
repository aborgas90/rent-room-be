const prismaClient = require("../../prisma-client");

const getAllReport = async ({ status, page = 1, limit = 10 }) => {
  try {
    const cleanStatus = status?.trim();
    const whereClause = cleanStatus ? { status: cleanStatus } : {};

    const [report, totalCount] = await Promise.all([
      prismaClient.problemReport.findMany({
        where: whereClause, 
        orderBy: {
          createdAt: "desc",
        },
        include: {
          owner: {
            select: {
              name: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prismaClient.problemReport.count({ where: whereClause }),
    ]);

    return {
      data: report,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    throw new Error("Gagal mengambil data laporan");
  }
};

const getByIdReport = async ({ id }) => {
  try {
    const findReport = await prismaClient.problemReport.findUnique({
      where: {
        id,
      },
    });

    return findReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const actionReport = async ({ id }) => {
  try {
    const actionReport = await prismaClient.problemReport.update({
      where: {
        id: id,
      },
      data: {
        status: "DONE",
      },
      select: {
        id: true,
        filename: true,
        status: true,
        user_id: true,
        owner_name: true,
        room_number: true,
      },
    });

    return actionReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getByIdReport,
  getAllReport,
  actionReport,
};
