const mongoose = require("mongoose");

const ComponenteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    precoSaco: { type: Number, required: true, default: 0 },
    pesoSacoKg: { type: Number, required: true, default: 50 },
    precoPorKg: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Componente", ComponenteSchema);
