const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const prisma = new PrismaClient();

const connectDatabase = async () => {
  if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: "./.env.test" });
  } else if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: "./.env" });
  } else {
    dotenv.config({ path: "./.env.production" }); 
  }
  try {
    await prisma.$connect();
    console.log("✅ Successful to connect the databases");
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = connectDatabase;
