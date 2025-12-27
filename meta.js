// commands/meta.js
const fs = require('fs');
const path = require('path');

const META_FILE = path.join(process.cwd(), 'metaS38.json');

module.exports = function handleMetaCommand(msg, text) {
    if (!text.toLowerCase().startsWith("!meta")) {
        return false;
    }
    
    const arg = text.replace(/^!meta\s*/i, "").trim().toLowerCase();
    
    if (!arg) {
        return msg.reply("Uso: !meta <exp|gold|mid|jungle|rota|ban>\nEx: !meta gold");
    }

    // Carrega o arquivo JSON
    let metaData;
    try {
        metaData = JSON.parse(fs.readFileSync(META_FILE, "utf8"));
    } catch (err) {
        console.error("Erro ao ler metaS38.json:", err);
        return msg.reply("⚠️ Erro interno ao obter o meta. O arquivo metaS38.json não foi encontrado ou está inválido. Tente mais tarde.");
    }

    const list = metaData[arg];
    
    if (!list || !Array.isArray(list) || list.length === 0) {
        return msg.reply(`🔍 Categoria *${arg}* não encontrada ou sem dados.`);
    }

    const top = list.slice(0, 10).map((h, i) => `${i + 1}. ${h}`).join("\n");
    return msg.reply(`📊 *Meta (${arg.toUpperCase()}) — fonte: vozes da minha cabeça*\n${top}`);
};