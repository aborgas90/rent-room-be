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

// 🟡 Ambil dari env, pecah kalau ada banyak origin (dipisahkan koma)
const allowedOrigins = ["http://localhost:3000" || APP_FRONTEND_URL];

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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.options("*", cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/uploads/image",
  express.static(path.join(__dirname, "uploads", "image"))
);

app.use("/api/v1", apiRouter);
apiRouter.use(publicRouter);
apiRouter.use(managementApi);
apiRouter.use(userApi);
apiRouter.use(dashboardApi);

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
