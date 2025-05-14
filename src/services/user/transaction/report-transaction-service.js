const prismaClient = require("../../../prisma-client");

const getTransactionPaymentOnUser = async (user_id) => {
  try {
    const data = await prismaClient.payment.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        user_id: true,
        midtrans_order_id: true,
        settlementTime: true,
        start_rent: true,
        end_rent: true,
        amount: true,
        status: true,
        payment_method: true,
        room: {
          select: {
            room_number: true, // ✅ diperbaiki
          },
        },
      },
    });

    const result = data.map((item) => ({
      user_id: item.user_id,
      invoice: item.midtrans_order_id,
      waktu_pembayaran: item.settlementTime || "-",
      start_rent: item.start_rent,
      end_rent: item.end_rent,
      amount: item.amount,
      status: item.status,
      room_number: item.room?.room_number,
      payment_type: item.payment_method,
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getTransactionPaymentOnUser,
};
