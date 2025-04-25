const { PrismaClient } = require('@prisma/client');
const prismaClient = new PrismaClient({
  errorFormat: 'pretty',
  log: ['info', 'warn', 'error', 'query']
});

module.exports = prismaClient;