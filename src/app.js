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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads", "image")));
app.use("/api/v1", apiRouter);
//route
apiRouter.use(publicRouter);
apiRouter.use(managementApi);
apiRouter.use(userApi);

app.get("/", (req, res) => {
  res.send("Hello Dunia Gelap!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
