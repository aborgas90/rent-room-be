const prismaClient = require("../../prisma-client");

const createReportMoney = async ({
  parseId,
  amount,
  type,
  category,
  description,
  transaction_date,
}) => {
  try {
    console.log(parseId);
    const createReport = await prismaClient.transaction.create({
      data: {
        admin_id: parseId,
        amount: amount,
        type: type,
        category: category,
        description: description,
        transaction_date: new Date(transaction_date),
      },
    });

    return createReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const editReportMoney = async ({
  transaction_id,
  amount,
  type,
  category,
  description,
  transaction_date,
}) => {
  try {
    const editReport = await prismaClient.transaction.update({
      where: {
        transaction_id: transaction_id,
      },
      data: {
        amount: amount,
        type: type,
        category: category,
        description: description,
        transaction_date: new Date(transaction_date),
      },
    });

    return editReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const deleteReportMoney = async ({ transaction_id }) => {
  try {
    const deleteReport = await prismaClient.transaction.delete({
      where: {
        transaction_id: transaction_id,
      },
    });

    return deleteReport;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getAllTransactionPaymentPaid = async (query = {}) => {
  try {
    const { status } = query;

    const whereClause = {
      ...(status ? { status } : {}), // hanya filter status jika ada
    };

    const paidTransactions = await prismaClient.payment.findMany({
      where: whereClause,
      orderBy: {
        settlementTime: "desc",
      },
      include: {
        room: {
          select: { room_number: true, room_id: true },
        },
        user: {
          select: { name: true, email: true, telephone: true },
        },
      },
    });

    console.log("Paid Transactions:", paidTransactions);
    return paidTransactions.map(
      ({
        amount,
        settlementTime,
        end_rent,
        payment_method,
        status,
        room,
        user,
      }) => ({
        room_id: room.room_id,
        roomNumber: room.room_number,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.telephone,
        nominal: amount,
        waktuPembayaran: settlementTime,
        metodePembayaran: payment_method,
        status,
        end_rent,
      })
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};

const sumIncomeReport = async () => {
  try {
    const result = await prismaClient.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: "PEMASUKAN", // Only sum where type is PEMASUKAN
      },
    });

    return result._sum.amount || 0;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const sumExpenseReport = async () => {
  try {
    const result = await prismaClient.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        type: "PENGELUARAN", // Only sum where type is PEMASUKAN
      },
    });

    return result._sum.amount || 0;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAllTransaction = async ({ type }) => {
  try {
    const whereClause = type ? { type: type.toUpperCase() } : {}; // jika type kosong, tidak filter apa-apa

    const result = await prismaClient.transaction.findMany({
      where: whereClause,
      orderBy: {
        transaction_date: "desc",
      },
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  createReportMoney,
  getAllTransactionPaymentPaid,
  sumIncomeReport,
  sumExpenseReport,
  getAllTransaction,
  editReportMoney,
  deleteReportMoney
};
