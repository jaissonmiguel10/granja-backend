const mongoose = require("mongoose");

const RemessaSchema = new mongoose.Schema(
  {
    galinheiro: { type: String, required: true },
    dataNascimento: { type: String, required: true },
    quantidade: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Ativa", "Encerrada"],
      default: "Ativa",
    },
    dadosFechamento: {
      dataEncerramento: { type: String },
      totalGasto: { type: Number, default: 0 },
      totalGanho: { type: Number, default: 0 },
      lucroLiquido: { type: Number, default: 0 },
      avesRestantes: { type: Number, default: 0 },
    },
    baixas: [
      {
        semana: { type: Number, required: true },
        quantidadePerdida: { type: Number, required: true, default: 0 },
      },
    ],
    vendas: [
      {
        semana: { type: Number, required: true },
        quantidadeVendida: { type: Number, required: true, default: 0 },
        valorUnitario: { type: Number, required: true, default: 0 },
        valorTotal: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Remessa", RemessaSchema);
