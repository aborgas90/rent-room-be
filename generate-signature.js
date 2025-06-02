const crypto = require("crypto");
require("dotenv").config();
const order_id = "INV-1748288466622-8";
const status_code = "200";
const gross_amount = "15000.00"; // string, jangan number
const serverKey = process.env.MIDTRANS_SERVER_KEY; // ganti dengan punya kamu
console.log("serverKey: ", serverKey);
const raw = order_id + status_code + gross_amount + serverKey;

const signature = crypto.createHash("sha512").update(raw).digest("hex");

console.log("\nGenerated signature_key:\n");
console.log(signature);
