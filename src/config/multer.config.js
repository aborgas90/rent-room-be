const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/image");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const filename =
      "report" + "-" + Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

//filter file type and size
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar (JPEG, PNG, GIF, WEBP) yang diperbolehkan"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // maksimal 5MB
  fileFilter: fileFilter,
});

module.exports = upload;
