const express = require('express');
const cors = require('cors');
const router = require('./routes/routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

// Estou exportando o app para usar no teste
module.exports = app;