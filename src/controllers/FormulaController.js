const Formula = require("../models/Formula");
const Componente = require("../models/Componente");

const TIPOS_RACAO = [
  "Pré-inicial",
  "Inicial",
  "Crescimento",
  "Engorda",
  "Postura",
];

class FormulaController {
  async listar(req, res) {
    try {
      const [componentes, formulasSalvas] = await Promise.all([
        Componente.find().sort({ nome: 1 }),
        Formula.find().populate("ingredientes.componenteId"),
      ]);

      const formulas = TIPOS_RACAO.map((tipo) => {
        const formulaExistente = formulasSalvas.find((f) => f.tipo === tipo);

        let ingredientes = [];
        if (formulaExistente) {
          ingredientes = formulaExistente.ingredientes
            .filter((item) => item.componenteId)
            .map((item) => {
              const comp = item.componenteId;
              const qtd = Number(item.quantidadeKg) || 0;
              const precoKg = Number(comp.precoPorKg) || 0;
              const custoItem = qtd * precoKg;

              return {
                componenteId: comp._id,
                nome: comp.nome,
                precoPorKg: precoKg,
                quantidadeKg: qtd,
                custoTotalItem: Number(custoItem.toFixed(2)),
              };
            });
        }

        const pesoTotalFormulaKg = ingredientes.reduce(
          (acc, cur) => acc + cur.quantidadeKg,
          0,
        );
        const custoTotalFormula = ingredientes.reduce(
          (acc, cur) => acc + cur.custoTotalItem,
          0,
        );
        const custoPorKg =
          pesoTotalFormulaKg > 0 ? custoTotalFormula / pesoTotalFormulaKg : 0;

        return {
          tipo,
          ingredientes,
          pesoTotalFormulaKg: Number(pesoTotalFormulaKg.toFixed(2)),
          custoTotalFormula: Number(custoTotalFormula.toFixed(2)),
          custoPorKg: Number(custoPorKg.toFixed(2)),
        };
      });

      return res.json({ formulas, componentes });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao carregar fórmulas" });
    }
  }

  async salvar(req, res) {
    try {
      const { tipo, ingredientes } = req.body;

      if (!TIPOS_RACAO.includes(tipo)) {
        return res.status(400).json({ erro: "Tipo de ração inválido" });
      }

      const formulaAtualizada = await Formula.findOneAndUpdate(
        { tipo },
        {
          tipo,
          ingredientes: ingredientes.map((i) => ({
            componenteId: i.componenteId,
            quantidadeKg: Number(i.quantidadeKg) || 0,
          })),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return res.json(formulaAtualizada);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar fórmula" });
    }
  }
}

module.exports = new FormulaController();
