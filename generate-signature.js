const crypto = require("crypto");
require("dotenv").config();
const order_id = "INV-1746903361264-40";
const status_code = "200";
const gross_amount = "133334.00"; // string, jangan number
const serverKey = process.env.MIDTRANS_SERVER_KEY; // ganti dengan punya kamu
console.log("serverKey: ", serverKey);
const raw = order_id + status_code + gross_amount + serverKey;

const signature = crypto.createHash("sha512").update(raw).digest("hex");

console.log("\nGenerated signature_key:\n");
console.log(signature);
