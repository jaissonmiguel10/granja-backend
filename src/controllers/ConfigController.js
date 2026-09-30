const Config = require("../models/Config");

class ConfigController {
  // Rota que valida se a senha digitada está correta
  async validarSenhaAdmin(req, res) {
    try {
      const { senha } = req.body;

      // Busca a senha cadastrada com a chave "SENHA_ADMIN"
      let configSenha = await Config.findOne({ chave: "SENHA_ADMIN" });

      // Se ainda não existir no banco, cria uma senha padrão "1234" automaticamente
      if (!configSenha) {
        configSenha = await Config.create({
          chave: "SENHA_ADMIN",
          valor: "1234",
        });
      }

      if (String(senha) === String(configSenha.valor)) {
        return res.json({ valido: true });
      }

      return res.status(401).json({ valido: false, erro: "Senha incorreta" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao validar senha" });
    }
  }
}

module.exports = new ConfigController();
