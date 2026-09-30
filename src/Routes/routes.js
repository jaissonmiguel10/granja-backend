const express = require("express");
const router = express.Router();

const DashboardController = require("../controllers/DashboardController");
const ComponenteController = require("../controllers/ComponenteController");
const FormulaController = require("../controllers/FormulaController");
const RemessaController = require("../controllers/RemessaController");
const ParametroController = require("../controllers/ParametroController");
const GalinhaController = require("../controllers/GalinhaController");
const ConfigController = require("../controllers/ConfigController");

// ================= DASHBOARD =================
router.get("/dashboard/resumo", DashboardController.resumo);

// ================= COMPONENTES / INGREDIENTES =================
router.get("/componentes", ComponenteController.listar);
router.post("/componentes", ComponenteController.criar);
router.put("/componentes/:id", ComponenteController.atualizar);
router.delete("/componentes/:id", ComponenteController.excluir);

// ================= FÓRMULAS DE RAÇÃO =================
router.get("/formulas", FormulaController.listar);
router.post("/formulas", FormulaController.salvar);

// ================= REMESSAS =================
// ================= REMESSAS =================
router.get("/remessas", RemessaController.listar);
router.post("/remessas", RemessaController.criar);
router.put("/remessas/:id", RemessaController.atualizar);
router.delete("/remessas/:id", RemessaController.excluir);
router.get("/remessas/:id/semanas", RemessaController.historicoSemanas);
router.post("/remessas/:id/baixa", RemessaController.registrarBaixa);
router.post("/remessas/:id/venda", RemessaController.registrarVenda);
router.post("/remessas/:id/encerrar", RemessaController.encerrar);

// ================= PARÂMETROS =================
router.get("/parametros", ParametroController.listar);
router.post("/parametros", ParametroController.salvar);

// ================= GALINHAS POEDEIRAS =================
router.get("/galinhas", GalinhaController.listar);
router.post("/galinhas", GalinhaController.criar);
router.put("/galinhas/:id", GalinhaController.atualizar);
router.delete("/galinhas/:id", GalinhaController.excluir);

//================== SENHA =========================
router.post("/auth/validar-senha", ConfigController.validarSenhaAdmin);
module.exports = router;
