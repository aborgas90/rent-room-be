const {
  createSnapPayment,
  getTransactionStatusOrderId,
  updatePaymentStatus,
  getRoomIdTransaction,
  getBookingStatus,
  hasPendingOrApprovedRequest,
  cekStatusPendingMidtransLast,
  getInvoiceByOrderId,
} = require("../../services/payment/payment-service");
const crypto = require("crypto");

const handlerCreatePayment = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { roomId, start_rent, end_rent } = req.body;

    const payment = await createSnapPayment({
      user_id,
      roomId,
      start_rent,
      end_rent,
    });

    res.status(200).json({
      status: true,
      message: "Berhasil membuat pembayaran",
      payment_token: payment.token,
      redirect_url: payment.redirect_url,
    });
  } catch (error) {
    const status = error.status || 500;
    const message =
      error.message || "Terjadi kesalahan saat membuat pembayaran";

    console.error("❌ Create payment error:", message);

    return res.status(status).json({
      status: false,
      message,
    });
  }
};

const handleGetTransactionOrderId = async (req, res, next) => {
  try {
    const result = await getTransactionStatusOrderId({
      order_id: req.params.orderId,
    });

    res.status(200).json({
      message: "Success mendapatkan status midtrans",
      data: result,
    });
  } catch (error) {
    next(error);
    console.error("❌ Error memproses status Midtrans:", error.message);
    res
      .status(500)
      .json({ message: "Gagal memproses status", error: error.message });
  }
};

const handlerMidtransNotification = async (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      transaction_status,
      fraud_status,
      settlement_time,
      payment_type,
      signature_key,
    } = req.body;
    console.log(
      "📩 Webhook received:",
      req.body.transaction_status,
      req.body.order_id
    );

    // 🔐 Verifikasi Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hashSource = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(hashSource)
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn("🚨 Signature mismatch from Midtrans!");
      return res.status(403).json({ message: "Invalid signature" });
    }

    // 🧠 Kirim ke service
    const notificationData = {
      order_id,
      transaction_status,
      fraud_status,
      settlement_time,
      payment_type,
    };

    const result = await updatePaymentStatus(notificationData);

    if (result?.alreadyProcessed) {
      return res.status(200).json({
        status_code: 200,
        message: "Webhook already processed, no changes applied",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "Notifikasi berhasil diproses",
    });
  } catch (error) {
    console.error("🚨 Error handler notifikasi:", error.message);
    return res.status(500).json({
      status_code: 500,
      message: "Gagal memproses notifikasi",
      error: error.message,
    });
  }
};

const handleGetIdRoomBooking = async (req, res, next) => {
  const { id } = req.params;
  const parseRoomId = parseInt(id, 10);

  try {
    if (isNaN(parseRoomId)) {
      return res.status(400).json({
        message: "room_id parameter is not a valid number",
      });
    }

    const findRoom = await getRoomIdTransaction(parseRoomId); // ✅ kirim sebagai integer

    if (!findRoom) {
      return res.status(404).json({
        status: false,
        message: `Room with ID ${parseRoomId} not found`,
      });
    }

    res.status(200).json({
      status: true,
      message: "Get By Id Successfully",
      data: findRoom,
    });
  } catch (error) {
    console.error("Error handleGetIdRoomBooking: ", error);
    next(error);
  }
};

const handlerGetBookingStatus = async (req, res, next) => {
  const { room_id } = req.params;
  const { user_id } = req.user;

  try {
    // opsional: validasi input
    if (isNaN(room_id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid room_id",
      });
    }

    const result = await getBookingStatus(room_id, user_id);

    res.status(200).json({
      status: true,
      message: "Get Booking Status Successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error handlerGetBookingStatus: ", error);
    next(error);
  }
};

const handlerGetPaymentStatusLast = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const result = await cekStatusPendingMidtransLast({
      user_id: parseInt(user_id, 10),
    });

    return res.status(200).json({
      status: true,
      message: "Get Status Last Payment Successful",
      data: result || [],
    });
  } catch (error) {
    console.error("Error handlerGetBookingStatus: ", error);
    next(error);
  }
};

const handlerGetInvoice = async (req, res) => {
  const { orderId } = req.params;
  const { user_id } = req.user;

  try {
    const invoice = await getInvoiceByOrderId(orderId, parseInt(user_id, 10));
    res.json({
      status: true,
      message: "Get Success to Get Invoice Data",
      data: invoice,
    });
  } catch (error) {
    console.error("❌ Invoice error:", error.message);
    res
      .status(error.statusCode || 500)
      .json({ status: false, message: error.message });
  }
};

module.exports = {
  handlerCreatePayment,
  handlerMidtransNotification,
  handleGetTransactionOrderId,
  handleGetIdRoomBooking,
  handlerGetBookingStatus,
  handlerGetPaymentStatusLast,
  handlerGetInvoice,
};
