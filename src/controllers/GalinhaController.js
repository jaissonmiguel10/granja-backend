const Galinha = require("../models/Galinha");

class GalinhaController {
  async listar(req, res) {
    try {
      const lista = await Galinha.find().sort({ createdAt: -1 });
      return res.json(lista);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar galinhas" });
    }
  }

  async criar(req, res) {
    try {
      const { identificacao, quantidade, gramasPorAve } = req.body;
      const novoLote = await Galinha.create({
        identificacao,
        quantidade: Number(quantidade),
        gramasPorAve: Number(gramasPorAve),
      });
      return res.status(201).json(novoLote);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao cadastrar galinhas" });
    }
  }

  async atualizar(req, res) {
    try {
      const { identificacao, quantidade, gramasPorAve } = req.body;
      const atualizado = await Galinha.findByIdAndUpdate(
        req.params.id,
        {
          identificacao,
          quantidade: Number(quantidade),
          gramasPorAve: Number(gramasPorAve),
        },
        { new: true },
      );
      return res.json(atualizado);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar galinhas" });
    }
  }

  async excluir(req, res) {
    try {
      await Galinha.findByIdAndDelete(req.params.id);
      return res.json({ mensagem: "Removido com sucesso" });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao excluir galinhas" });
    }
  }
}

module.exports = new GalinhaController();
