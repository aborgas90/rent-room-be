const prismaClient = require("../../prisma-client");

const getIncomeThisMonth = async () => {
  try {
    {
      const result = await prismaClient.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          transaction_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
          },
          type: "PEMASUKAN",
        },
      });

      return result._sum ?? 0;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getExpenseThisMonth = async (params) => {
  try {
    {
      const result = await prismaClient.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          transaction_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              0
            ),
          },
          type: "PENGELUARAN",
        },
      });

      return result._sum ?? 0;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getFilledAndTotalRooms = async () => {
  try {
    const totalRooms = await prismaClient.room.count();

    const filledRooms = await prismaClient.room.count({
      where: {
        status: "TERSEWA",
      },
    });

    return {
      filled: filledRooms,
      total: totalRooms,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUserCount = async () => {
  try {
    const result = await prismaClient.user.count({
      where: {
        User_Roles: {
          some: {
            Role: {
              roles_name: "member",
            },
          },
        },
        rentedRoom: {
          status: "TERSEWA", // hanya jika dia sedang menempati kamar
        },
      },
    });

    return {
      count: result,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getMonthlyTransactions = async (year = 2025) => {
  try {
    const transactions = await prismaClient.transaction.findMany({
      where: {
        transaction_date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      select: {
        amount: true,
        transaction_date: true,
        type: true,
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      income: 0,
      expense: 0,
    }));

    transactions.forEach((tx) => {
      const monthIndex = new Date(tx.transaction_date).getMonth();
      const amount = parseFloat(tx.amount);

      if (tx.type === "PEMASUKAN") {
        monthlyData[monthIndex].income += amount;
      } else if (tx.type === "PENGELUARAN") {
        monthlyData[monthIndex].expense += amount;
      }
    });

    return monthlyData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getLast5Payments = async () => {
  try {
    const payments = await prismaClient.payment.findMany({
      orderBy: { payment_date: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            telephone: true,
            address: true,
          },
        },
        room: {
          select: {
            room_number: true,
            price: true,
            status: true,
            description: true,
            bathroomType: true,
          },
        },
      },
    });

    return payments;
  } catch (error) {
    console.error("❌ Gagal ambil 5 pembayaran terakhir:", error);
    throw error;
  }
};

module.exports = {
  getIncomeThisMonth,
  getExpenseThisMonth,
  getFilledAndTotalRooms,
  getUserCount,
  getMonthlyTransactions,
  getLast5Payments,
};
