const express = require("express");
const app = express();
require("dotenv").config({ path: [".env"] });
const port = process.env.APP_PORT;
const cors = require("cors");
const publicRouter = require("./routes/public/public-api");
const managementApi = require("./routes/management-resource/management-resource-api");
const { userApi } = require("./routes/user/user-api");
const apiRouter = express.Router();
const path = require("path");
const cookieParser = require("cookie-parser");
const {
  dashboardApi,
} = require("./routes/management-resource/dashboard/dashboard-resource-api");
require("./services/scheduler/paymentScheduler");

const fs = require("fs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "https://ponirantkost.com",
  "http://ponirantkost.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.get("/api/v1/auth/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  res.json({ user: decoded });
});

app.use(
  "/uploads/image",
  express.static(path.join(__dirname, "uploads", "image"))
);

app.use("/api/v1", apiRouter);
apiRouter.use(publicRouter);
apiRouter.use(managementApi);
apiRouter.use(userApi);
apiRouter.use(dashboardApi);
app.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err.message.includes("File harus berupa")
  ) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }

  // default error handler
  return res.status(500).json({
    status: false,
    message: "Internal Server Error",
  });
});

// ⬇️ Logging error
const logErrorToFile = (context, err) => {
  const logDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, "app-errors.log");
  const timestamp = new Date().toISOString();
  const content = `[${timestamp}] [${context}] ${err.message}\n`;
  fs.appendFileSync(logFile, content);
};

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  logErrorToFile("UncaughtException", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  logErrorToFile(
    "UnhandledRejection",
    reason instanceof Error ? reason : new Error(String(reason))
  );
});

app.get("/", (req, res) => {
  res.send("Hello Dunia Gelap dontol!");
});

module.exports = app;
