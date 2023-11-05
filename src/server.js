const express = require('express');
// const axios = require('axios');
const cors = require('cors');

const postgres = require('postgres');
const router = require('./routes/routes');
require('dotenv').config( { path: '../.env' } );

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID, RIOT_API } = process.env;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(router);


// Configuração do Postgres
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});


// Tirar daqui pra baixo e colocar no index.js, porém quando tudo estiver correto, menos o export
// Função para verificar se o banco de dados está online
async function getPgVersion() {
  const result = await sql`select version()`;
  if (!result) {
    return "Offline ❌";
  }
  return "Online 🚀";
}

// Configuração Listen do Express 
app.listen(process.env.PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Banco de dados: ${PGDATABASE}`);
  console.log(`Banco:`, await getPgVersion());
});

// Estou exportando o app para usar no teste
module.exports = app;