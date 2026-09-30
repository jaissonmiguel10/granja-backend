const Remessa = require("../models/Remessa");
const Parametro = require("../models/Paramet");
const Formula = require("../models/Formula");
const { calcularIdade } = require("../utils/dateUtils");

class RemessaController {
  async listar(req, res) {
    try {
      const remessas = await Remessa.find().sort({ createdAt: -1 });
      return res.json(remessas);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar remessas" });
    }
  }

  async criar(req, res) {
    try {
      const { galinheiro, dataNascimento, quantidade } = req.body;
      const novaRemessa = await Remessa.create({
        galinheiro,
        dataNascimento,
        quantidade: Number(quantidade),
      });
      return res.status(201).json(novaRemessa);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao criar remessa" });
    }
  }

  async atualizar(req, res) {
    try {
      const { galinheiro, dataNascimento, quantidade } = req.body;
      const remessaAtualizada = await Remessa.findByIdAndUpdate(
        req.params.id,
        { galinheiro, dataNascimento, quantidade: Number(quantidade) },
        { new: true },
      );
      return res.json(remessaAtualizada);
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao atualizar remessa" });
    }
  }

  async excluir(req, res) {
    try {
      await Remessa.findByIdAndDelete(req.params.id);
      return res.json({ mensagem: "Remessa removida com sucesso" });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao deletar remessa" });
    }
  }

  // ================= CÁLCULO FINANCEIRO, VENDAS E SEMANAS =================
  async historicoSemanas(req, res) {
    try {
      const remessa = await Remessa.findById(req.params.id);
      if (!remessa) {
        return res.status(404).json({ erro: "Remessa não encontrada" });
      }

      const [parametros, formulas] = await Promise.all([
        Parametro.find().sort({ semana: 1 }),
        Formula.find().populate("ingredientes.componenteId"),
      ]);

      function obterPrecoKg(tipo) {
        const f = formulas.find((item) => item.tipo === tipo);
        if (!f || !f.ingredientes || f.ingredientes.length === 0) return 0;

        let pesoTotal = 0;
        let custoTotal = 0;
        f.ingredientes.forEach((i) => {
          if (i.componenteId) {
            const qtd = Number(i.quantidadeKg) || 0;
            const preco = Number(i.componenteId.precoPorKg) || 0;
            pesoTotal += qtd;
            custoTotal += qtd * preco;
          }
        });

        return pesoTotal > 0 ? custoTotal / pesoTotal : 0;
      }

      const precosRacao = {
        "Pré-inicial": obterPrecoKg("Pré-inicial"),
        Crescimento: obterPrecoKg("Crescimento"),
        Engorda: obterPrecoKg("Engorda"),
      };

      const { dias, semana: semanaAtual } = calcularIdade(
        remessa.dataNascimento,
      );

      let avesAtuais = Number(remessa.quantidade);
      let custoTotalAcumulado = 0;
      let consumoKgAcumulado = 0;
      let totalReceitaVendas = 0;
      let totalAvesVendidas = 0;
      let totalMortes = 0;

      const historicoSemanas = [];

      for (let sem = 1; sem <= semanaAtual; sem++) {
        // Baixas desta semana
        const registroBaixa = (remessa.baixas || []).find(
          (b) => Number(b.semana) === sem,
        );
        const perdasDestaSemana = registroBaixa
          ? Number(registroBaixa.quantidadePerdida)
          : 0;
        totalMortes += perdasDestaSemana;

        // Vendas desta semana (valorTotal direto, sem multiplicação)
        const registroVenda = (remessa.vendas || []).find(
          (v) => Number(v.semana) === sem,
        );
        const vendasDestaSemana = registroVenda
          ? Number(registroVenda.quantidadeVendida)
          : 0;
        const totalVendaSemana = registroVenda
          ? Number(registroVenda.valorTotal)
          : 0;
        const valorUnitarioVenda =
          vendasDestaSemana > 0 ? totalVendaSemana / vendasDestaSemana : 0;

        totalReceitaVendas += totalVendaSemana;
        totalAvesVendidas += vendasDestaSemana;

        // Tipo de ração da fase
        let tipoRacao = "Pré-inicial";
        if (sem >= 5 && sem <= 14) {
          tipoRacao = "Crescimento";
        } else if (sem >= 15) {
          tipoRacao = "Engorda";
        }

        const precoKgRacao = precosRacao[tipoRacao] || 0;

        // Parâmetro de gramas da semana
        let param = parametros.find((p) => Number(p.semana) === sem);
        if (!param && parametros.length > 0) {
          param = parametros[parametros.length - 1];
        }
        const gramasPorAveDia = param ? Number(param.gramasPorAve) : 0;

        // Consumo calculado sobre as aves ativas
        const consumoSemanaKg = (avesAtuais * gramasPorAveDia * 7) / 1000;
        const custoSemana = consumoSemanaKg * precoKgRacao;

        custoTotalAcumulado += custoSemana;
        consumoKgAcumulado += consumoSemanaKg;

        historicoSemanas.push({
          semana: sem,
          tipoRacao,
          precoKgRacao: Number(precoKgRacao.toFixed(2)),
          avesInicioSemana: avesAtuais,
          perdasDestaSemana,
          vendasDestaSemana,
          valorUnitarioVenda: Number(valorUnitarioVenda.toFixed(2)),
          totalVendaSemana: Number(totalVendaSemana.toFixed(2)),
          gramasPorAveDia,
          consumoSemanaKg: Number(consumoSemanaKg.toFixed(1)),
          custoSemana: Number(custoSemana.toFixed(2)),
        });

        // Abate perdas e vendas para o rebanho da próxima semana
        avesAtuais = Math.max(
          0,
          avesAtuais - perdasDestaSemana - vendasDestaSemana,
        );
      }

      // Custo unitário com base nas aves que foram aproveitadas (vivas restantes + vendidas)
      const avesAproveitadas = avesAtuais + totalAvesVendidas;
      const custoPorAveViva =
        avesAproveitadas > 0 ? custoTotalAcumulado / avesAproveitadas : 0;
      const lucroLote = totalReceitaVendas - custoTotalAcumulado;

      return res.json({
        remessa: {
          _id: remessa._id,
          galinheiro: remessa.galinheiro,
          dataNascimento: remessa.dataNascimento,
          quantidadeInicial: Number(remessa.quantidade),
          avesVivasAtuais: avesAtuais,
          totalAvesVendidas,
          totalMortes,
          idadeDias: dias,
          semanaAtual,
          status: remessa.status || "Ativa",
          dadosFechamento: remessa.dadosFechamento || null,
        },
        resumoFinanceiro: {
          custoTotalAcumulado: Number(custoTotalAcumulado.toFixed(2)),
          consumoKgAcumulado: Number(consumoKgAcumulado.toFixed(1)),
          custoPorAveViva: Number(custoPorAveViva.toFixed(2)),
          totalReceitaVendas: Number(totalReceitaVendas.toFixed(2)),
          lucroLote: Number(lucroLote.toFixed(2)),
        },
        historicoSemanas: historicoSemanas.reverse(),
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ erro: "Erro ao processar histórico da remessa" });
    }
  }

  // ================= REGISTRAR BAIXA =================
  async registrarBaixa(req, res) {
    try {
      const { semana, quantidadePerdida } = req.body;
      const remessa = await Remessa.findById(req.params.id);
      if (!remessa) {
        return res.status(404).json({ erro: "Remessa não encontrada" });
      }

      if (!remessa.baixas) remessa.baixas = [];
      const numSemana = Number(semana);
      const numQtd = Number(quantidadePerdida) || 0;

      const index = remessa.baixas.findIndex(
        (b) => Number(b.semana) === numSemana,
      );
      if (index >= 0) {
        remessa.baixas[index].quantidadePerdida = numQtd;
      } else {
        remessa.baixas.push({ semana: numSemana, quantidadePerdida: numQtd });
      }

      await remessa.save();
      return res.json({ mensagem: "Baixa registrada com sucesso", remessa });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao registrar baixa" });
    }
  }

  // ================= REGISTRAR VENDA (DIRETO VALOR TOTAL) =================
  async registrarVenda(req, res) {
    try {
      const { semana, quantidadeVendida, valorTotal } = req.body;
      const remessa = await Remessa.findById(req.params.id);
      if (!remessa) {
        return res.status(404).json({ erro: "Remessa não encontrada" });
      }

      if (!remessa.vendas) remessa.vendas = [];
      const numSemana = Number(semana);
      const numQtd = Number(quantidadeVendida) || 0;
      const numValorTotal = Number(valorTotal) || 0;
      const precoUnit =
        numQtd > 0 ? Number((numValorTotal / numQtd).toFixed(2)) : 0;

      const index = remessa.vendas.findIndex(
        (v) => Number(v.semana) === numSemana,
      );
      if (index >= 0) {
        remessa.vendas[index] = {
          semana: numSemana,
          quantidadeVendida: numQtd,
          valorUnitario: precoUnit,
          valorTotal: numValorTotal,
        };
      } else {
        remessa.vendas.push({
          semana: numSemana,
          quantidadeVendida: numQtd,
          valorUnitario: precoUnit,
          valorTotal: numValorTotal,
        });
      }

      await remessa.save();
      return res.json({ mensagem: "Venda registrada com sucesso", remessa });
    } catch (error) {
      return res.status(400).json({ erro: "Erro ao registrar venda" });
    }
  }

  // ================= ENCERRAR REMESSA / FECHAR LOTE =================
  async encerrar(req, res) {
    try {
      const { id } = req.params;
      const { totalGasto, totalGanho, lucroLiquido, avesRestantes } = req.body;

      const remessa = await Remessa.findById(id);
      if (!remessa) {
        return res.status(404).json({ erro: "Remessa não encontrada" });
      }

      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, "0");
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const ano = hoje.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;

      remessa.status = "Encerrada";
      remessa.dadosFechamento = {
        dataEncerramento: dataFormatada,
        totalGasto: Number(totalGasto) || 0,
        totalGanho: Number(totalGanho) || 0,
        lucroLiquido: Number(lucroLiquido) || 0,
        avesRestantes: Number(avesRestantes) || 0,
      };

      await remessa.save();

      return res.json({ mensagem: "Remessa encerrada com sucesso!", remessa });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ erro: "Erro ao encerrar remessa" });
    }
  }
}

module.exports = new RemessaController();
