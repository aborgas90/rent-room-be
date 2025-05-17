const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

let storage;

if (process.env.STORAGE_DRIVER === "local") {
  const uploadDir = path.join(__dirname, "../../uploads/image");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const filename = `report-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, filename);
    },
  });
} else {
  // Untuk GCS, kita hanya butuh buffer
  storage = multer.memoryStorage();
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa gambar (JPG, PNG, GIF, WEBP)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
