const mongoose = require("mongoose");

const GalinhaSchema = new mongoose.Schema(
  {
    identificacao: {
      type: String,
      required: true,
      trim: true,
    },
    quantidade: {
      type: Number,
      required: true,
    },
    gramasPorAve: {
      type: Number,
      required: true,
      default: 110, // Média comum para poedeiras adultas (em gramas)
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Galinha", GalinhaSchema);
