function calcularIdade(dataStr) {
  if (!dataStr || typeof dataStr !== "string") return { dias: 0, semana: 1 };

  let dia, mes, ano;
  if (dataStr.includes("/")) {
    [dia, mes, ano] = dataStr.split("/").map(Number);
  } else if (dataStr.includes("-")) {
    const partes = dataStr.split("-").map(Number);
    if (partes[0] > 1000) {
      [ano, mes, dia] = partes; // AAAA-MM-DD
    } else {
      [dia, mes, ano] = partes; // DD-MM-AAAA
    }
  } else {
    return { dias: 0, semana: 1 };
  }

  const dataNasc = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  const diferencaTempo = hoje.getTime() - dataNasc.getTime();
  const dias = Math.max(0, Math.floor(diferencaTempo / (1000 * 60 * 60 * 24)));
  const semana = Math.max(1, Math.ceil((dias + 1) / 7));

  return { dias, semana };
}

module.exports = { calcularIdade };
