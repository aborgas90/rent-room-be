const fs = require("fs");
const path = require("path");
const { bucket, bucketName } = require("../../config/gcs.config");

const uploadFile = async (file) => {
  const filename = `report-${Date.now()}${path.extname(file.originalname)}`;

  if (process.env.STORAGE_DRIVER === "local") {
    const uploadPath = path.join(__dirname, "../../uploads/image");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    const localPath = path.join(uploadPath, filename);
    fs.writeFileSync(localPath, file.buffer);

    return {
      filename,
      url: `/uploads/image/${filename}`,
    };
  }

  if (process.env.STORAGE_DRIVER === "gcs") {
    const gcsFile = bucket.file(`public/${filename}`);
    const stream = gcsFile.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    return new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/public/${filename}`;
        resolve({ filename: `public/${filename}`, url: publicUrl });
      });
      stream.end(file.buffer);
    });
  }

  throw new Error("❌ STORAGE_DRIVER tidak dikenal");
};

module.exports = { uploadFile };
