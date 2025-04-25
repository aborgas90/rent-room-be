const midtransClient = require("midtrans-client");
const prismaClient = require("../../prisma-client");
require("dotenv").config({ path: [".env"] });
const { snap, coreApi } = require("../../config/midtrans.config");

//create payment
const createSnapPayment = async ({ user_id, roomId, start_rent, end_rent }) => {
  console.log("user id :: ", user_id);
  const user = await prismaClient.user.findUnique({
    where: { user_id },
  });

  const room = await prismaClient.room.findUnique({
    where: { room_id: roomId },
  });

  if (!user || !room) {
    throw new Error("User atau kamar tidak ditemukan");
  }

  const existingRental = await prismaClient.payment.findFirst({
    where: {
      user_id: user_id,
      status: "PAID", // Hanya cari status yang sudah dibayar
    },
    include: {
      room: true, // Ambil informasi kamar yang sudah disewa
    },
  });

  if (existingRental) {
    throw new Error("User sudah menyewa kamar lain.");
  }

  if (room.status !== "TERSEDIA") {
    throw new Error("Kamar sudah tidak tersedia");
  }

  if (!start_rent || !end_rent) {
    throw new Error("Tanggal mulai dan tanggal selesai sewa harus diisi");
  }

  const startDate = new Date(start_rent);
  const endDate = new Date(end_rent);

  if (startDate >= endDate) {
    throw new Error(
      "Tanggal selesai sewa harus lebih besar dari tanggal mulai"
    );
  }

  const now = new Date();
  if (startDate < now) {
    throw new Error("Tanggal mulai sewa tidak boleh di masa lalu");
  }

  const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;
  const pricePerMonth = parseFloat(room.price);
  const days = Math.ceil((endDate - startDate) / MILLISECONDS_IN_A_DAY);
  const grossAmount = Math.ceil((days / 30) * pricePerMonth);

  const orderId = `INV-${Date.now()}-${user_id}`;
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: user.name,
      email: user.email,
      phone: user.telephone,
    },
    item_details: [
      {
        id: `room-${room.room_id}`,
        name: `Sewa Kamar No. ${room.room_number}`,
        price: grossAmount,
        quantity: 1,
      },
    ],
  };

  // ⬇️ Midtrans API dulu, di luar Prisma
  const midtransResponse = await snap.createTransaction(parameter);

  // ⬇️ Setelah berhasil, baru simpan ke DB
  const result = await prismaClient.$transaction(async (tx) => {
    const updatedRoom = await tx.room.update({
      where: {
        room_id: room.room_id,
        status: "TERSEDIA",
      },
      data: {
        status: "TERKUNCI",
        locked_at: new Date(),
      },
    });

    const payment = await tx.payment.create({
      data: {
        user_id: user.user_id,
        room_id: room.room_id,
        amount: grossAmount,
        payment_date: new Date(),
        payment_method: "MIDTRANS",
        midtrans_order_id: orderId,
        midtrans_token: midtransResponse.token,
        midtrans_redirect_url: midtransResponse.redirect_url,
        status: "PENDING",
        start_rent: startDate.toISOString(),
        end_rent: endDate.toISOString(),
      },
    });

    return {
      redirect_url: midtransResponse.redirect_url,
      token: midtransResponse.token,
      order_id: orderId,
      payment_id: payment.payment_id,
    };
  });

  return result;
};

//unlocking room when user not payment schedule
const unlockExpiredRooms = async () => {
  const lockTimeout = 60 * 60 * 1000;

  const roomToUnlock = await prismaClient.room.findMany({
    where: {
      status: "TERKUNCI",
      locked_at: {
        lt: new Date(Date.now() - lockTimeout),
      },
    },
  });


  for (const room of roomToUnlock) {
    await prismaClient.room.update({
      where: { room_id: room.room_id },
      data: { status: "TERSEDIA", locked_at: null },
    });

    console.log(`🔓 Room ${room.room_id} is now available.`);
  }
};

setInterval(unlockExpiredRooms,60 *  60 * 1000);

//get midtrans status data
const getTransactionStatusOrderId = async ({ order_id }) => {
  try {
    let payment = await prismaClient.payment.findUnique({
      where: {
        midtrans_order_id: order_id,
      },
    });

    if (!payment) {
      throw new Error("Transaksi tidak ditemukan untuk order_id tersebut");
    }

    const statusResponse = await coreApi.transaction.status(order_id);

    console.log("📦 Status transaksi Midtrans:", statusResponse);

    return statusResponse;
  } catch (error) {
    console.error("❌ Gagal mendapatkan status id:", error.message);
    throw error;
  }
};

//update sync midtrans to db
const updatePaymentStatus = async (notification) => {
  try {
    const {
      order_id,
      transaction_status,
      fraud_status,
      settlement_time,
      payment_type,
    } = notification;

    console.log(`📥 Notifikasi diterima:`, {
      order_id,
      transaction_status,
      fraud_status,
    });

    if (!order_id) return;

    const payment = await prismaClient.payment.findUnique({
      where: { midtrans_order_id: order_id },
    });

    if (!payment || payment.status === "SUCCESS") return;

    let newStatus = "PENDING";

    if (transaction_status === "capture") {
      newStatus = fraud_status === "challenge" ? "CHALLENGE" : "SUCCESS";
    } else if (transaction_status === "settlement") {
      newStatus = "PAID";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      newStatus = "FAILED";
    }

    const convertTime = settlement_time
      ? new Date(settlement_time).toISOString()
      : null;

    await prismaClient.payment.update({
      where: { midtrans_order_id: order_id },
      data: {
        status: newStatus,
        payment_method: payment_type,
        settlementTime: convertTime,
      },
    });

    if (newStatus === "PAID") {
      await prismaClient.room.update({
        where: { room_id: payment.room_id },
        data: { status: "TERSEWA", tenant_id: payment.user_id },
      });

      await prismaClient.transaction.create({
        data: {
          admin_id: 2,
          payment_id: payment.payment_id,
          amount: payment.amount,
          type: "PEMASUKAN",
          category: payment_type,
          transaction_date: convertTime,
        },
      });

      console.log(`🏠 Kamar ${payment.room_id} di-set sebagai TERSEWA.`);
    } else if (newStatus === "FAILED") {
      await prismaClient.room.update({
        where: { room_id: payment.room_id },
        data: { status: "AVAILABLE", locked_at: null },
      });

      console.log(
        `Room ${payment.room_id} is now available again due to failed payment.`
      );
    }
  } catch (error) {
    console.error("❌ Gagal mendapatkan mengupdate:", error.message);
    throw error;
  }
};

//schedule expired end room user
const expireFinishedRentals = async () => {
  const now = new Date();
  console.log(
    `⏰ [${new Date().toISOString()}] Mengecek kamar yang masa sewanya habis...`
  );

  // Cari semua payment yang sudah dibayar dan masa sewanya habis
  const expiredPayments = await prismaClient.payment.findMany({
    where: {
      status: "PAID",
      end_rent: {
        lt: now,
      },
    },
    include: {
      room: true,
    },
  });

  console.log(expiredPayments, "query");

  for (const payment of expiredPayments) {
    const roomId = payment.room_id;

    // Ubah status kamar jadi TERSEDIA
    await prismaClient.room.update({
      where: { room_id: roomId },
      data: {
        status: "TERSEDIA",
        tenant_id: null,
      },
    });

    console.log(
      `⏰ Masa sewa kamar ${roomId} habis. Kamar jadi tersedia kembali.`
    );
  }
};

setInterval(expireFinishedRentals, 60 * 60 * 1000);

module.exports = {
  createSnapPayment,
  updatePaymentStatus,
  getTransactionStatusOrderId,
};
