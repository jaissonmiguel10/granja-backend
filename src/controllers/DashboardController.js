const Remessa = require("../models/Remessa");
const Parametro = require("../models/Paramet");
const Galinha = require("../models/Galinha");
const { calcularIdade } = require("../utils/dateUtils");

class DashboardController {
  async resumo(req, res) {
    try {
      const [remessas, parametros, galinhas] = await Promise.all([
        Remessa.find({ status: { $ne: "Encerrada" } }), // Apenas remessas ativas consomem ração
        Parametro.find().sort({ semana: 1 }),
        Galinha.find().sort({ createdAt: -1 }),
      ]);

      const mapaGalinheiros = {};
      let totalKgFrangos = 0;

      remessas.forEach((remessa) => {
        const nomeGalinheiro = (remessa.galinheiro || "Sem Nome").trim();
        const { dias, semana } = calcularIdade(remessa.dataNascimento);

        let paramSemana = parametros.find(
          (p) => Number(p.semana) === Number(semana),
        );
        if (!paramSemana && parametros.length > 0) {
          paramSemana = parametros[parametros.length - 1];
        }

        const gramasPorAve = paramSemana ? Number(paramSemana.gramasPorAve) : 0;
        const consumoLoteKg =
          (Number(remessa.quantidade || 0) * gramasPorAve) / 1000;

        if (!mapaGalinheiros[nomeGalinheiro]) {
          mapaGalinheiros[nomeGalinheiro] = {
            nome: nomeGalinheiro,
            totalAves: 0,
            totalKg: 0,
            lotes: [],
          };
        }

        mapaGalinheiros[nomeGalinheiro].totalAves += Number(
          remessa.quantidade || 0,
        );
        mapaGalinheiros[nomeGalinheiro].totalKg += consumoLoteKg;
        totalKgFrangos += consumoLoteKg;

        mapaGalinheiros[nomeGalinheiro].lotes.push({
          id: remessa._id,
          quantidade: Number(remessa.quantidade || 0),
          dias,
          semana,
          gramasPorAve,
          consumoKg: Number(consumoLoteKg.toFixed(1)),
        });
      });

      const frangosPorGalinheiro = Object.values(mapaGalinheiros).map((g) => ({
        ...g,
        totalKg: Number(g.totalKg.toFixed(1)),
      }));

      let totalKgGalinhas = 0;
      const listaGalinhas = galinhas.map((g) => {
        const consumoKg =
          (Number(g.quantidade || 0) * Number(g.gramasPorAve || 0)) / 1000;
        totalKgGalinhas += consumoKg;

        return {
          _id: g._id,
          identificacao: g.identificacao,
          quantidade: Number(g.quantidade || 0),
          gramasPorAve: Number(g.gramasPorAve || 0),
          totalKg: Number(consumoKg.toFixed(1)),
        };
      });

      const totalGeralKg = Number(
        (totalKgFrangos + totalKgGalinhas).toFixed(1),
      );

      return res.json({
        resumo: {
          totalGeralKg,
          totalKgFrangos: Number(totalKgFrangos.toFixed(1)),
          totalKgGalinhas: Number(totalKgGalinhas.toFixed(1)),
        },
        galinhas: listaGalinhas,
        frangosPorGalinheiro,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ erro: "Falha ao calcular dados da granja" });
    }
  }
}

module.exports = new DashboardController();
