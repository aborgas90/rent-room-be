const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');

const  connectDatabase = async () => {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: './.env.test' });
  } else if (process.env.NODE_ENV === 'development'){
    dotenv.config({ path: './.env' }); 
  } else {
    dotenv.config({ path: './.env.production' });
  }
  try {
    await prisma.$connect();
    console.log("✅ Successful to connect the databases")
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports =  connectDatabase;