// admin.js
const ADMINS_LIST = [
  "5521993267426", //campos
];

async function handleAdminCommands(msg, text, shared) {
  const { ownerNumber } = shared;
  const lowerText = text.toLowerCase();

  // ⚠️ Se NÃO for comando de admin, ignora
  if (!lowerText.startsWith("!")) return false;

  // Comandos admin válidos
  const ADMIN_COMMANDS = ["!chat"];

  if (!ADMIN_COMMANDS.includes(lowerText)) {
    return false;
  }

  // Identificação segura do número
  const senderJid = msg.author || msg.from;
  const userNumber = senderJid.split("@")[0];

  const isAdmin =
    userNumber === ownerNumber || ADMINS_LIST.includes(userNumber);

  if (!isAdmin) {
    await msg.reply("🚫 Você não tem permissão para usar este comando.");
    return true; // comando tratado
  }

  // === !CHAT ===
  if (lowerText === "!chat") {
    const chat = await msg.getChat();

    await msg.reply(
      `🧾 *Informações do Chat*\n\n` +
      `🆔 *ID:* ${chat.id._serialized}\n` +
      `💬 *Nome:* ${chat.name || "Chat privado"}\n` +
      `👥 *É grupo?* ${chat.isGroup ? "Sim" : "Não"}`
    );

    return true;
  }

  return false;
}

module.exports = {
  handleAdminCommands,
  admins: ADMINS_LIST,
};
