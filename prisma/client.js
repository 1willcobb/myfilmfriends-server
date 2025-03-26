// Import the PrismaClient from the @prisma/client package
const { PrismaClient } = require('@prisma/client');

// Initialize a new instance of PrismaClient
const prisma = new PrismaClient();

// Export the Prisma instance to be used in other parts of the app
module.exports = prisma;