const midtransClient = require("midtrans-client");
const prismaClient = require("../../prisma-client");
require("dotenv").config({ path: [".env"] });
const { snap, coreApi } = require("../../config/midtrans.config");
const { ResponseError } = require("../../error/error-response");
const {
  sendPaymentStatusNotification,
} = require("../scheduler/paymentScheduler");

//create payment
const createSnapPayment = async ({ user_id, roomId, start_rent, end_rent }) => {
  const user = await prismaClient.user.findUnique({ where: { user_id } });
  const room = await prismaClient.room.findUnique({
    where: { room_id: roomId },
  });

  const userRoom = await prismaClient.room.findFirst({
    where: {
      tenant_id: user_id,
      status: "TERSEWA",
    },
  });

  if (userRoom) {
    throw new ResponseError(
      409,
      `Anda masih menyewa kamar nomor ${userRoom.room_number}. Tidak dapat menyewa lebih dari satu kamar.`
    );
  }

  if (!user || !room) {
    throw new Error("User atau kamar tidak ditemukan");
  }

  if (!start_rent || !end_rent) {
    throw Response("Tanggal mulai dan tanggal selesai sewa harus diisi");
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
    callbacks: {
      finish: `${process.env.APP_FRONTEND_URL}/dashboard/payment/success?order_id=${orderId}`,
    },
  };

  const midtransResponse = await snap.createTransaction(parameter);

  // ⬇️ Atomic room locking & payment insert
  const result = await prismaClient.$transaction(async (tx) => {
    // Re-check & lock the room inside the transaction
    const updatedRoom = await tx.room.updateMany({
      where: {
        room_id: room.room_id,
        status: "TERSEDIA",
      },
      data: {
        status: "TERKUNCI",
        locked_at: new Date(),
      },
    });

    if (updatedRoom.count === 0) {
      throw new ResponseError(
        409,
        "Kamar sudah tidak tersedia atau sedang diproses oleh pengguna lain."
      );
    }

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

//get midtrans status data
const getTransactionStatusOrderId = async ({ order_id }) => {
  try {
    const payment = await prismaClient.payment.findFirst({
      where: { midtrans_order_id: order_id },
    });

    if (!payment) {
      throw new Error("Transaksi tidak ditemukan untuk order_id tersebut");
    }

    const statusResponse = await coreApi.transaction.status(order_id);

    // ✅ Update DB agar sinkron
    await prismaClient.payment.update({
      where: { midtrans_order_id: order_id },
      data: {
        status: statusResponse.transaction_status.toUpperCase(),
        settlementTime: statusResponse.settlement_time
          ? new Date(statusResponse.settlement_time)
          : undefined,
      },
    });

    return statusResponse;
  } catch (error) {
    console.error("❌ Gagal mendapatkan status id:", error.message);
    throw error;
  }
};

const updateUserRole = async (user_id, new_role = "MEMBER") => {
  // ⬅️ Cari semua role user sekarang
  const currentRoles = await prismaClient.user_Roles.findMany({
    where: { user_id },
    include: { Role: true },
  });

  const hasSuperAdmin = currentRoles.some(
    (ur) => ur.Role.roles_name === "SUPER_ADMIN"
  );

  if (hasSuperAdmin) {
    console.log(`🛡️ Skipping role update: User ${user_id} is SUPER_ADMIN`);
    return;
  }

  // ⬇️ Cek apakah sudah jadi MEMBER
  const memberRole = await prismaClient.roles.findUnique({
    where: { roles_name: new_role },
  });

  if (!memberRole) {
    throw new Error(`Role '${new_role}' not found`);
  }

  const alreadyHasRole = currentRoles.some(
    (ur) => ur.roles_id === memberRole.roles_id
  );

  if (!alreadyHasRole) {
    await prismaClient.user_Roles.create({
      data: {
        user_id,
        roles_id: memberRole.roles_id,
      },
    });

    console.log(`✅ User ${user_id} upgraded to ${new_role}`);
  }
};

//update sync midtrans to db
const mapMidtransStatus = (transaction_status, fraud_status) => {
  switch (transaction_status) {
    case "capture":
      return fraud_status === "challenge" ? "CHALLENGE" : "PAID";
    case "settlement":
      return "PAID";
    case "expire":
      return "EXPIRED";
    case "cancel":
      return "CANCELLED";
    case "deny":
      return "FAILED";
    case "refund":
      return "REFUNDED";
    default:
      return "PENDING";
  }
};

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

    if (!payment) {
      console.warn(`❌ Tidak ditemukan payment untuk order_id: ${order_id}`);
      return;
    }

    const finalStatuses = [
      "PAID",
      "SUCCESS",
      "EXPIRED",
      "CANCELLED",
      "FAILED",
      "REFUNDED",
    ];
    if (finalStatuses.includes(payment.status)) {
      console.log(
        `ℹ️ Webhook ignored: status sudah final (${payment.status}).`
      );
      return { alreadyProcessed: true };
    }

    const newStatus = mapMidtransStatus(transaction_status, fraud_status);

    console.log(
      "📦 Status diterima:",
      transaction_status,
      "→ Akan jadi:",
      newStatus
    );

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

    console.log(
      `✅ Status transaksi "${order_id}" berhasil diupdate ke: ${newStatus}`
    );

    const user = await prismaClient.user.findUnique({
      where: { user_id: payment.user_id },
    });
    const room = await prismaClient.room.findUnique({
      where: { room_id: payment.room_id },
    });

    if (newStatus === "PAID") {
      await prismaClient.room.update({
        where: { room_id: payment.room_id },
        data: { status: "TERSEWA", tenant_id: payment.user_id },
      });

      await prismaClient.transaction.create({
        data: {
          admin_id: 2, // bisa diganti jika dinamis
          payment_id: payment.payment_id,
          amount: payment.amount,
          type: "PEMASUKAN",
          category: payment_type,
          transaction_date: convertTime,
        },
      });

      await updateUserRole(payment.user_id, "MEMBER");
      await sendPaymentStatusNotification(user, room, newStatus, payment);
      console.log(`🏠 Kamar ${payment.room_id} di-set sebagai TERSEWA.`);
    } else if (
      ["FAILED", "EXPIRED", "CANCELLED", "REFUNDED"].includes(newStatus)
    ) {
      await prismaClient.room.update({
        where: { room_id: payment.room_id },
        data: { status: "TERSEDIA", locked_at: null },
      });

      await sendPaymentStatusNotification(user, room, newStatus, payment);
      console.log(
        `Room ${payment.room_id} is now available again due to ${newStatus}.`
      );
    }
  } catch (error) {
    console.error("❌ Gagal mengupdate:", error.message);
    throw error;
  }
};

const getRoomIdTransaction = async (roomId) => {
  try {
    const roomData = await prismaClient.room.findUnique({
      where: {
        room_id: roomId,
      },
      include: {
        roomFacilities: {
          include: {
            facility: true,
          },
        },
        owner: {
          select: {
            user_id: true,
            name: true,
          },
        },
        tenant: true,
        payments: true,
      },
    });

    if (!roomData) {
      throw new Error("Room not found");
    }

    // Ambil daftar fasilitas langsung
    const facilities = roomData.roomFacilities.map((rf) => rf.facility);

    // Return tanpa roomFacilities
    const { roomFacilities, ...roomWithoutRoomFacilities } = roomData;

    return {
      ...roomWithoutRoomFacilities,
      facilities,
    };
  } catch (error) {
    console.error("❌ Gagal mendapatkan data kamar:", error.message);
    throw error;
  }
};

const getBookingStatus = async (room_id, user_id) => {
  const result = await prismaClient.bookingRequest.findFirst({
    where: {
      room_id: parseInt(room_id, 10),
      user_id: parseInt(user_id, 10),
    },
    orderBy: {
      created_at: "desc",
    },
  });

  console.log(result, user_id, room_id, "result booking status");
  return result?.status || "NOT_FOUND";
};

const hasPendingOrApprovedRequest = async (room_id, user_id) => {
  const existingRequest = await prismaClient.bookingRequest.findFirst({
    where: {
      room_id: parseInt(room_id, 10),
      user_id: parseInt(user_id, 10),
      status: {
        in: ["PENDING_APPROVAL", "APPROVED"],
      },
    },
  });

  console.log(existingRequest, "existing request");

  return !!existingRequest;
};

const cekStatusPendingMidtransLast = async ({ user_id }) => {
  try {
    const oneHourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prismaClient.payment.findFirst({
      where: {
        user_id,
        status: "PENDING",
        createdAt: { gte: oneHourAgo },
      },
      orderBy: {
        createdAt: "desc", // Ambil transaksi terbaru
      },
    });

    return result;
  } catch (error) {
    console.error("❌ Gagal cek Status Pending:", error.message);
    throw error;
  }
};

async function getInvoiceByOrderId(orderId, user_id) {
  const tx = await prismaClient.payment.findUnique({
    where: { midtrans_order_id: orderId },
    include: {
      user: true,
      room: true,
    },
  });

  if (!tx) {
    throw new Error("Transaksi tidak ditemukan");
  }

  if (tx.user_id !== user_id) {
    const err = new Error("Akses ditolak");
    err.statusCode = 403;
    throw err;
  }

  return {
    midtrans_order_id: tx.midtrans_order_id,
    user_name: tx.user.name,
    email: tx.user.email,
    room_number: tx.room.room_number,
    payment_method: tx.payment_method,
    status: tx.status,
    amount: tx.amount,
    start_rent: tx.start_rent,
    end_rent: tx.end_rent,
    settlementTime: tx.settlementTime,
  };
}

module.exports = {
  createSnapPayment,
  updatePaymentStatus,
  getTransactionStatusOrderId,
  getRoomIdTransaction,
  getBookingStatus,
  hasPendingOrApprovedRequest,
  cekStatusPendingMidtransLast,
  getInvoiceByOrderId,
};
