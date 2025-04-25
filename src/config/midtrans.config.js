require("dotenv").config({ path: [".env"] });
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false, // Gunakan `true` jika sudah live
  serverKey: process.env.MIDTRANS_SERVER_KEY, // Pastikan ENV ini ada
  clientKey: process.env.MIDTRANS_CLIENT_KEY, // Optional (biasanya dipakai di frontend)
});

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = { snap, coreApi };
