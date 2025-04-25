const {
  createSnapPayment,
  getTransactionStatusOrderId,
  updatePaymentStatus,
} = require("../../services/payment/payment-service");
const crypto = require("crypto");

const handlerCreatePayment = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { roomId, start_rent, end_rent } = req.body;
    console.log(req.body, " :: req.body");

    const payment = await createSnapPayment({
      user_id,
      roomId,
      start_rent,
      end_rent,
    });

    res.status(200).json({
      message: "Berhasil membuat pembayaran",
      payment_token: payment.token,
      redirect_url: payment.redirect_url,
    });
  } catch (error) {
    next(error);
    console.error("Create payment error:", error.message);
    res
      .status(500)
      .json({ message: "Gagal membuat pembayaran", error: error.message });
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

const handlerMidtransNotification = async (req, res, next) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      transaction_status,
      fraud_status,
      settlement_time,
      payment_type,
    } = req.body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const input = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(input)
      .digest("hex");

    const notificationData = {
      order_id,
      transaction_status,
      fraud_status,
      settlement_time,
      payment_type,
    };

    await updatePaymentStatus(notificationData);

    res.status(200).json({
      status_code: 200,
      message: "Notifikasi berhasil diproses",
    });
  } catch (error) {
    next(error);
    console.error("🚨 Error handler notifikasi:", error.message);
    res.status(500).json({
      status_code: 500,
      message: "Gagal memproses notifikasi",
      error: error.message,
    });
  }
};

module.exports = {
  handlerCreatePayment,
  handlerMidtransNotification,
  handleGetTransactionOrderId,
};
