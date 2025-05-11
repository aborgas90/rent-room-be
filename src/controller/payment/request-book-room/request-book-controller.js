const prismaClient = require("../../../prisma-client");
const {
  requestBookRoomService,
  actionApproveRequestBook,
  getAllRequestBook,
  rejectBookingRequest,
  getApprovedBookingDetail,
} = require("../../../services/payment/request-book/request-book-room-service");
const handlerRequestBookRoom = async (req, res, next) => {
  const { user_id } = req.user;
  const { room_id, start_rent, end_rent } = req.body;

  try {
    const user = await prismaClient.user.findUnique({ where: { user_id } });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Pengguna tidak ditemukan.",
      });
    }

    const room = await prismaClient.room.findUnique({ where: { room_id } });
    if (!room || room.status !== "TERSEDIA") {
      return res.status(400).json({
        status: false,
        message: "Kamar tidak tersedia untuk disewa saat ini.",
      });
    }

    const result = await requestBookRoomService(
      user.user_id,
      room.room_id,
      start_rent,
      end_rent
    );

    return res.status(201).json({
      status: true,
      message: "Permintaan booking berhasil dikirim.",
      data: result,
    });
  } catch (error) {
    if (error.message?.toLowerCase().includes("permintaan booking aktif")) {
      return res.status(409).json({
        status: false,
        message:
          "Anda sudah memiliki permintaan booking aktif untuk kamar ini.",
      });
    }

    console.error("❌ handlerRequestBookRoom error:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
    });
  }
};

const handlerGetAllRequestBook = async (req, res, next) => {
  try {
    const result = await getAllRequestBook();

    res.status(200).json({
      message: "Get all request book room successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handleActionApproveRequestBook = async (req, res, next) => {
  try {
    const request_id = parseInt(req.params.request_id);
    const admin_id = parseInt(req.user.user_id);
    //admin id

    const request = await prismaClient.bookingRequest.findUnique({
      where: { id: request_id },
    });

    if (!request || request.status !== "PENDING_APPROVAL") {
      return res
        .status(400)
        .json({ error: "Invalid or already processed request" });
    }

    const room = await prismaClient.room.findUnique({
      where: { room_id: request.room_id },
    });

    if (!room || room.status !== "TERSEDIA") {
      return res.status(400).json({ error: "Room not available anymore" });
    }

    const result = await actionApproveRequestBook(request, admin_id);

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ handleActionApproveRequestBook error:", error);
    next(error);
  }
};

const handleActionRejectRequestBook = async (req, res) => {
  try {
    const request_id = parseInt(req.params.request_id);
    const admin_id = parseInt(req.user.user_id);
    const { notes } = req.body;

    if (isNaN(request_id) || isNaN(admin_id)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const result = await rejectBookingRequest({ request_id, admin_id, notes });

    return res.status(200).json({
      message: "Booking request rejected successfully.",
      rejected_request: result,
    });
  } catch (error) {
    console.error("❌ Reject handler error:", error.message);
    return res.status(400).json({ error: error.message });
  }
};

const handlerGetApprovedBookingDetail = async (req, res, next) => {
  const { room_id } = req.params;
  const user_id = req.user.user_id;

  try {
    const booking = await getApprovedBookingDetail(room_id, user_id);

    if (!booking) {
      return res.status(404).json({
        status: false,
        message: "Booking tidak ditemukan atau belum disetujui",
      });
    }

    res.status(200).json({
      status: true,
      message: "Detail booking ditemukan",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Gagal ambil detail booking:", error.message);
    next(error);
  }
};

module.exports = {
  handlerRequestBookRoom,
  handlerGetAllRequestBook,
  handleActionApproveRequestBook,
  handleActionRejectRequestBook,
  handleActionRejectRequestBook,
  handlerGetApprovedBookingDetail,
};
