// === Função para o Menu Principal ===
function formatMainMenu(name, roleLabel, totalCmds) {
  return (
`Olá, *${name}.* Tipo de Usuário: *${roleLabel}*
Comandos feitos: *${totalCmds}*
────────────────────────
*|*━━━ ✦ *🤖 Destiny* ✦
*|*
*|*━━━ ✦ 🔎 *MENU PRINCIPAL* ✦
*|*► *!menu* 0  ❓ Informação
*|*► *!menu* 1  🖼️ Criar Figurinha
*|*► *!menu* 2  ⚒️ Utilidades
*|*► *!menu* 3  🧩 Mobile Legends
*|*► *!menu* 4  💬 Sugestões
*|*━━✦༻ _*Feito por: Campos*_ ༺✦`
  );
}

// === Função para informações do bot (submenu 0) ===
function formatBotInfo(name, roleLabel, totalCmds) {
  return (
`Olá, *${name}* 👋
*─── INFORMAÇÕES ───*
🤖 *Destiny* — *ChatBot*
Versão: 1.0.1
Desenvolvedor: Campos.
Tipo de Usuário: *${roleLabel}*
Comandos feitos por você: *${totalCmds}*`
  );
}

// === Função para o Menu de Figurinhas (submenu 1) ===
function formatStickerMenu(name, roleLabel, totalCmds) {
  return (
`Olá, *${name}.* \nTipo de Usuário: *${roleLabel}*
Comandos feitos: *${totalCmds}*
────────────────────────
*|*━━━ ✦ *🤖 Destiny* ✦
*|*━━━━ ✦ 🖼️ *FIGURINHAS* ✦
*|*► *!s* - Envie imagem/vídeo com legenda *!s*
*|*► *!snome <nome do pack>* - Envie/responda uma imagem/vídeo com legenda *!snome*
*|*► *!scustom <tamanho>* - Envie imagem/vídeo com legenda *!scustom*
*|*━━✦༻ _*Feito por: Campos*_ ༺✦`
  );
}

module.exports = {
    formatMainMenu,
    formatBotInfo,
    formatStickerMenu
};