require("dotenv").config(); // Load .env before anything else
const app = require("./app.js");
const connectDatabase = require("./database/database.js");

const port = process.env.APP_PORT; // fallback

connectDatabase();

if (process.env.NODE_ENV === "development") {
  console.log(
    `Development environment detected. NODE_ENV = ${process.env.NODE_ENV}`
  );
} else if (process.env.NODE_ENV === "test") {
  console.log(`Test environment detected. NODE_ENV = ${process.env.NODE_ENV}`);
}

app.listen(port, () => {
  console.log(`🌍 App listening on port ${port}`);
});
