const mongoose = require("mongoose");

const ParametroSchema = new mongoose.Schema(
  {
    semana: {
      type: Number,
      required: true,
      unique: true,
    },
    gramasPorAve: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Com a letra "o" no final:
module.exports = mongoose.model("Paramet", ParametroSchema);
