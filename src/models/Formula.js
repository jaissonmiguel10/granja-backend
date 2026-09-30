const mongoose = require("mongoose");

const FormulaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ["Pré-inicial", "Inicial", "Crescimento", "Engorda", "Postura"],
      unique: true,
    },
    ingredientes: [
      {
        componenteId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Componente",
          required: true,
        },
        quantidadeKg: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Formula", FormulaSchema);
