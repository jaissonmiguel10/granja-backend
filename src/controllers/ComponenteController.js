const Componente = require("../models/Componente");

class ComponentController {
  async listar(req, res) {
    try {
      const componentes = await Componente.find().sort({ nome: 1 });
      return res.json(componentes);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar componentes" });
    }
  }

  async criar(req, res) {
    try {
      const { nome, precoSaco, pesoSacoKg } = req.body;
      const vPreco = Number(precoSaco) || 0;
      const vPeso = Number(pesoSacoKg) || 1;
      const precoPorKg = Number((vPreco / vPeso).toFixed(2));

      const novo = await Componente.create({
        nome,
        precoSaco: vPreco,
        pesoSacoKg: vPeso,
        precoPorKg,
      });
      return res.status(201).json(novo);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao criar componente" });
    }
  }

  async atualizar(req, res) {
    try {
      const { nome, precoSaco, pesoSacoKg } = req.body;
      const vPreco = Number(precoSaco) || 0;
      const vPeso = Number(pesoSacoKg) || 1;
      const precoPorKg = Number((vPreco / vPeso).toFixed(2));

      const atualizado = await Componente.findByIdAndUpdate(
        req.params.id,
        { nome, precoSaco: vPreco, pesoSacoKg: vPeso, precoPorKg },
        { new: true },
      );
      return res.json(atualizado);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar componente" });
    }
  }

  async excluir(req, res) {
    try {
      await Componente.findByIdAndDelete(req.params.id);
      return res.json({ mensagem: "Componente excluído com sucesso" });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao deletar componente" });
    }
  }
}

module.exports = new ComponentController();
