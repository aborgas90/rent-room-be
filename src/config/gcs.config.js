const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

if (!process.env.GCP_CREDENTIAL_JSON) {
  console.log(process.env.GCP_CREDENTIAL_JSON, " ISISNYA APA");
  throw new Error(
    "❌ ENV GCP_CREDENTIAL_JSON is undefined. Cek file .env kamu."
  );
}

let credentials;
try {
  credentials = JSON.parse(process.env.GCP_CREDENTIAL_JSON);
} catch (err) {
  throw new Error(
    "❌ GCP_CREDENTIAL_JSON format tidak valid. Gunakan JSON satu baris dengan \\n di private_key."
  );
}

const storage = new Storage({ credentials });
const bucketName = process.env.GCS_BUCKET;
const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket, bucketName };
