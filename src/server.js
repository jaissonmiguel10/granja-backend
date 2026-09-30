require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 3333;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "❌ ERRO: A variável MONGO_URI não foi definida no arquivo .env!",
  );
  process.exit(1);
}

// Inicia a escuta da porta antes ou em conjunto com a conexão
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Conectado com sucesso ao MongoDB!");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
  });
