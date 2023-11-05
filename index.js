const app = require('./src/server');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { PORT, PGDATABASE } = process.env;

const getPgVersion = async () => {
  await prisma.$queryRaw`select version()`;
  if(!prisma) {
    return "Offline ❌";
  }
  return "Online 🚀";
}
// Configuração Listen do Express 
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Banco de dados: ${PGDATABASE}`);
  console.log(`Banco:`, await getPgVersion());
});
