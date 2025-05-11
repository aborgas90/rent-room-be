const prismaClient = require("../../../prisma-client");
const { sendEmail } = require("../../../utils/emailSender");
const {
  bookingRequestEmail,
} = require("../../../utils/templates/bookingRequestEmail");
const { createSnapPayment } = require("../payment-service");

//function requestBookRoomService()
const requestBookRoomService = async (
  user_id,
  room_id,
  start_rent,
  end_rent
) => {
  try {
    // 🔍 Cek apakah ada booking yang masih aktif
    const existingRequest = await prismaClient.bookingRequest.findFirst({
      where: {
        user_id,
        room_id,
        status: {
          in: ["PENDING_APPROVAL", "APPROVED"],
        },
      },
    });

    if (existingRequest) {
      throw new Error(
        "Anda sudah memiliki permintaan booking aktif untuk kamar ini."
      );
    }

    // ✅ Lanjut buat booking baru
    const result = await prismaClient.bookingRequest.create({
      data: {
        user_id,
        room_id,
        start_rent: new Date(start_rent),
        end_rent: new Date(end_rent),
        status: "PENDING_APPROVAL",
      },
    });

    // Kirim notifikasi email ke admin
    const user = await prismaClient.user.findUnique({ where: { user_id } });
    const room = await prismaClient.room.findUnique({ where: { room_id } });

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "📢 Booking Request Masuk",
      html: bookingRequestEmail({
        userName: user.name,
        roomNumber: room.room_number,
        startDate: result.start_rent.toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
        endDate: result.end_rent.toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
      }),
    });

    return result;
  } catch (error) {
    console.error("❌ Gagal memproses booking:", error.message);
    throw error;
  }
};

const getAllRequestBook = async () => {
  try {
    const result = await prismaClient.bookingRequest.findMany({
      include: {
        user: true,
        room: true,
      },
    });

    return result;
  } catch (error) {
    console.error("❌ Gagal mendapatkan semua request book:", error.message);
    throw error;
  }
};

const actionApproveRequestBook = async (request, admin_id) => {
  try {
    const payment = await createSnapPayment({
      user_id: request.user_id,
      roomId: request.room_id,
      start_rent: request.start_rent,
      end_rent: request.end_rent,
    });

    await prismaClient.bookingRequest.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        approved_at: new Date(),
        admin_id: admin_id,
        payment_id: payment.payment_id,
      },
    });

    return {
      message: "Request approved and payment link created",
      redirect_url: payment.redirect_url,
      token: payment.token,
      order_id: payment.order_id,
      payement_id: payment.payment_id,
    };
  } catch (error) {
    if (
      error.message.includes("tidak tersedia") ||
      error.message.includes("already booked")
    ) {
      // Optional: auto reject request
      await prismaClient.bookingRequest.update({
        where: { id: request.id },
        data: {
          status: "REJECTED",
          rejected_at: new Date(),
          notes: "Room already booked by another user",
        },
      });

      throw new Error("Booking failed: Room already booked by someone else.");
    }

    console.error("❌ Error approving booking request:", error.message);
    throw error;
  }
};

const rejectBookingRequest = async ({ request_id, admin_id, notes }) => {
  const request = await prismaClient.bookingRequest.findUnique({
    where: { id: request_id },
  });

  if (!request || request.status !== "PENDING_APPROVAL") {
    throw new Error("Request not found or already processed.");
  }

  const updated = await prismaClient.bookingRequest.update({
    where: { id: request_id },
    data: {
      status: "REJECTED",
      rejected_at: new Date(),
      admin_id,
      notes: notes || "Request rejected by admin.",
    },
  });

  return updated;
};

const getApprovedBookingDetail = async (room_id, user_id) => {
  const result = await prismaClient.bookingRequest.findFirst({
    where: {
      room_id: parseInt(room_id),
      user_id: parseInt(user_id),
      status: "APPROVED",
    },
    include: {
      room: true,
      payment: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (!result || !result.room) {
    throw new Error("Booking atau data kamar tidak ditemukan");
  }

  return {
    room_id: result.room_id,
    room_number: result.room.room_number,
    priceMonth: result.room.price,
    totalPrice: result.payment.amount,
    start_rent: result.start_rent,
    end_rent: result.end_rent,
    redirect_url: result.payment?.midtrans_redirect_url || null,
    payment_status: result.payment?.status || null,
  };
};

module.exports = {
  requestBookRoomService,
  getAllRequestBook,
  actionApproveRequestBook,
  rejectBookingRequest,
  getApprovedBookingDetail,
};
