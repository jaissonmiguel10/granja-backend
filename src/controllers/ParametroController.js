const Parametro = require("../models/Paramet");

class ParametroController {
  async listar(req, res) {
    try {
      const parametros = await Parametro.find().sort({ semana: 1 });
      return res.json(parametros);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar parâmetros" });
    }
  }

  async salvar(req, res) {
    try {
      const listaParametros = req.body;
      if (!Array.isArray(listaParametros)) {
        return res.status(400).json({ erro: "Envie uma lista de parâmetros" });
      }

      for (const item of listaParametros) {
        const numSemana = Number(item.semana);
        const numGramas = Number(item.gramasPorAve) || 0;

        await Parametro.findOneAndUpdate(
          { semana: numSemana },
          { $set: { semana: numSemana, gramasPorAve: numGramas } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }

      return res.json({ mensagem: "Parâmetros atualizados com sucesso" });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao salvar parâmetros" });
    }
  }
}

module.exports = new ParametroController();
