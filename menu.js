module.exports = async function handleMenuCommand(
  msg,
  text,
  chatId,
  userNumber,
  shared,
  name,
  roleLabel,
  totalCmds
) {
  if (!text) return false;

  const lower = text.toLowerCase();
  const admins = shared?.admins || [];

  // === !MENU ===
  if (lower === "!menu") {
    const menu = `
Olá, *${name}.*
Tipo de Usuário: *${roleLabel}*
Comandos feitos: *${totalCmds}*
────────────────────────
*|*━━━ ✦ *🤖 Destiny* ✦
*|*
*|*► *!menu 0* - Informações do Bot
*|*► *!menu 1* - Menu de Figurinhas
*|*► *!menu 2* - Utilidades
*|*► *!menu 3* - Mobile Legends
*|*► *!menu 4* - Mandar Sugestões
*|*
*|*━━✦༻ _*Feito por: Campos*_ ༺✦
`;
    await msg.reply(menu);
    return true;
  }

  // === !MENU X ===
  if (lower.startsWith("!menu ")) {
    const option = lower.split(" ")[1];

    // 0 - INFO
    if (option === "0") {
      await msg.reply(`
🤖 *Destiny Bot*
Criado para auxiliar grupos e jogadores.
Usuário: *${name}*
Cargo: *${roleLabel}*
Comandos usados: *${totalCmds}*
`);
      return true;
    }

    // 1 - STICKERS
    if (option === "1") {
      await msg.reply(`
Olá, *${name}.* \nTipo de Usuário: *${roleLabel}*
Comandos feitos: *${totalCmds}*
────────────────────────
*|*━━━ ✦ *🤖 Destiny* ✦
*|*━━━━ ✦ 🖼️ *FIGURINHAS* ✦
*|*► *!s* - Envie imagem/vídeo com legenda *!s*
*|*► *!snome <nome do pack>* - Envie/responda uma imagem/vídeo com legenda *!snome*
*|*► *!scustom <tamanho>* - Envie imagem/vídeo com legenda *!scustom*
*|*━✦༻ _*Feito por: Campos*_ ༺✦
`);
      return true;
    }

    // 2 - UTILIDADES
    if (option === "2") {
      let util = `
Olá, *${name}.*
Tipo de Usuário: *${roleLabel}*
Comandos feitos: *${totalCmds}*
────────────────────────
*|*━━━ ✦ *🤖 Destiny* ✦
*|*━━━━ ✦ ⚒️ *UTILIDADES* ✦
`;

      if (admins.includes(userNumber)) {
        util += `
*|*► *!mt* - Marca todos
*|*► *!antmt* - Não ser marcado novamente
*|*► *!buscar* - Buscar vídeo no YouTube
*|*► *!play* - Vídeo para aúdio
*|*► *!texto* - Áudio para texto
*|*► *!casal* - Chance de casal
*|*► *!top10* - Usuários mais ativos
`;
      }

      util += `
*|*► *!fig* - Criar figurinha
*|*
*|*━━✦༻ _*Feito por: Campos*_ ༺✦
`;

      await msg.reply(util);
      return true;
    }

    // 3 - MOBILE LEGENDS
    if (option === "3") {
      await msg.reply(`
Olá, *${name}.*
Tipo de Usuário: *${roleLabel}*
────────────────────────
*|*━━━ ✦ *🤖 Destiny* ✦
*|*━━━━ ✦ 🧩 *Mobile Legends* ✦
*|*► *!perfil*
*|*► *!rank*
*|*► *!elo*
*|*► *!id*
*|*► *!dias*
*|*► *!personalizada*
*|*► *!time 1*
*|*► *!time 2*
*|*► *!meta <rota>*
*|*► *!meta ban*
*|*━━✦༻ _*Feito por: Campos*_ ༺✦
`);
      return true;
    }

    // 4 - SUGESTÕES
    if (option === "4") {
      await msg.reply(`
*💬 SUGESTÕES*
Envie:
*Sugestão: <sua ideia>*

Exemplo:
Sugestão: Adicionar comando de build automática
`);
      return true;
    }

    await msg.reply("❌ Opção inválida. Use *!menu*.");
    return true;
  }

  return false;
};
