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
    const { status, page = 1, limit = 10 } = query;

    const whereClause = {
      ...(status ? { status } : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [paidTransactions, total] = await Promise.all([
      prismaClient.payment.findMany({
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
        skip,
        take,
      }),

      prismaClient.payment.count({ where: whereClause }),
    ]);

    const mappedData = paidTransactions.map(
      ({
        amount,
        settlementTime,
        end_rent,
        payment_method,
        status,
        room,
        user,
        start_rent,
        midtrans_order_id,
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
        start_rent,
        end_rent,
        invoice: midtrans_order_id,
      })
    );

    return {
      data: mappedData,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
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

const getAllPayments = async ({
  search = "",
  payment_method,
  status,
  month,
  year,
  page = 1,
  limit = 10,
}) => {
  try {
    const whereClause = {
      ...(payment_method && { payment_method }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { midtrans_order_id: { contains: search } },
          { user: { email: { contains: search } } },
          { user: { name: { contains: search } } },
        ],
      }),
      ...(month &&
        year && {
          payment_date: {
            gte: new Date(year, month - 1, 1), // awal bulan
            lt: new Date(year, month, 1), // awal bulan berikutnya
          },
        }),
    };

    const total = await prismaClient.payment.count({ where: whereClause });

    const data = await prismaClient.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            telephone: true,
          },
        },
        room: {
          select: {
            room_number: true,
          },
        },
      },
      orderBy: { payment_date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formatted = data.map((item) => ({
      room_id: item.room_id,
      roomNumber: item.room?.room_number || "-",
      userName: item.user?.name || "-",
      userEmail: item.user?.email || "-",
      userPhone: item.user?.telephone || "",
      nominal: item.amount,
      waktuPembayaran: item.payment_date,
      metodePembayaran: item.payment_method,
      status: item.status,
      start_rent: item.start_rent,
      end_rent: item.end_rent,
      invoice: item.midtrans_order_id,
    }));

    return {
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error getAllPayments:", error.message);
    throw error;
  }
};

const getAllTransaction = async ({ type, page = 1, limit = 10 }) => {
  try {
    const whereClause = type ? { type: type.toUpperCase() } : {};
    console.log(whereClause, "WHERE")

    const total = await prismaClient.transaction.count({ where: whereClause });

    const data = await prismaClient.transaction.findMany({
      where: whereClause,
      include: {
        payment: {
          select: {
            midtrans_order_id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { transaction_date: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const result = data.map((item) => ({
      transaction_id: item.transaction_id,
      invoice: item.payment?.midtrans_order_id || null,
      nama_pembayar: item.payment?.user?.name || "-",
      email_pembayar: item.payment?.user?.email || "-",
      owner_name: item.admin?.name || "-",
      owner_email: item.admin?.email || "-",
      amount: item.amount,
      type: item.type,
      category: item.category,
      description: item.description,
      transaction_date: item.transaction_date,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      data: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error getAllTransaction:", error.message);
    throw error;
  }
};

module.exports = {
  createReportMoney,
  getAllTransactionPaymentPaid,
  sumIncomeReport,
  sumExpenseReport,
  getAllPayments,
  getAllTransaction,
  editReportMoney,
  deleteReportMoney,
};
