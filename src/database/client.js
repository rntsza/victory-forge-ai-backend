const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

prisma.$disconnect()

module.exports = prisma;