// === IMPORTS PRINCIPAIS ===
const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
require("dotenv").config();

const { log } = require("./utils/logger");

// === COMMANDS ===
const handleProfileCommands = require("./commands/profile");
const handleCustomMatchCommands = require("./commands/customMatch");
const handleMetaCommand = require("./commands/meta");
const { handleAdminCommands, admins } = require("./commands/admin");
const handleMenuCommand = require("./commands/menu");
const handleUtilityCommands = require("./commands/utility");
const handleStickerCommands = require("./commands/sticker");
const handleSuggestionCommand = require("./commands/suggestion");
const textoCommand = require("./commands/texto.command");

// === FLAGS ===
const isTestMode = process.env.TEST_MODE === "true";

// === CLIENTE ===
const client = new Client();

// === CONTADOR DE COMANDOS ===
const userStats = {};

// === BANNER ===
function showBanner() {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════╗
║ ██████╗ ███████╗███████╗████████╗██╗███╗   ██╗██╗   ██╗    ║
║ ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██║████╗  ██║╚██╗ ██╔╝    ║
║ ██║  ██║█████╗  ███████╗   ██║   ██║██╔██╗ ██║ ╚████╔╝     ║
║ ██║  ██║██╔══╝  ╚════██║   ██║   ██║██║╚██╗██║  ╚██╔╝      ║
║ ██████╔╝███████╗███████║   ██║   ██║██║ ╚████║   ██║       ║
║ ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═══╝   ╚═╝       ║
╚════════════════════════════════════════════════════════════╝
`);
}

// === QR / READY ===
if (!isTestMode) {
  client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
  client.on("ready", () => log("INFO", "Bot conectado ao WhatsApp."));
}

// === MESSAGE HANDLER ===
client.on("message", async (msg) => {
  const text = (msg.body || "").trim();
  if (!text || msg.id.fromMe) return;

  // Ignora mensagens de status, broadcast ou grupos que não são pessoas
  if (msg.from.endsWith("@broadcast") || msg.from.endsWith("@status")) return;

  let handled = false;

  try {
    const chat = await msg.getChat();
    chat.sendStateTyping();

    // Normaliza o número do usuário
    let userNumber = msg.from;
    if (userNumber.endsWith("@c.us") || userNumber.endsWith("@g.us")) {
      userNumber = userNumber.split("@")[0];
    }

    const name = msg._data?.notifyName || "Usuário";

    // Checa se é admin
    const roleLabel = admins.includes(userNumber) ? "🛠️ Admin" : "👤 Usuário";

    // Inicializa estatísticas do usuário se não existir
    if (!userStats[userNumber]) userStats[userNumber] = { commands: 0 };

    // Shared object
    const shared = {
      client,
      admins,
      setUserState: () => {}
    };

    // === MENU (PRIORIDADE) ===
    if (!handled && await handleMenuCommand(
      msg,
      text,
      msg.from,
      userNumber,
      shared,
      name,
      roleLabel,
      userStats[userNumber].commands
    )) handled = true;

    if (!handled && handleSuggestionCommand(text, msg)) handled = true;
    if (!handled && handleProfileCommands(msg, text, userNumber, "", shared)) handled = true;
    if (!handled && handleMetaCommand(msg, text)) handled = true;
    if (!handled && handleCustomMatchCommands(msg, text, userNumber, msg.from, shared)) handled = true;
    if (!handled && await handleAdminCommands(msg, text, shared)) handled = true;
    if (!handled && await handleUtilityCommands(msg, text, shared)) handled = true;
    if (!handled && await handleStickerCommands(msg, text, { client })) handled = true;

    // === !TEXTO ===
    if (!handled && text.startsWith("!texto")) {
      handled = true;
      await textoCommand(msg);
    }

    // === CONTAGEM DE COMANDOS ===
    if (handled && text.startsWith("!")) {
      userStats[userNumber].commands++;
    }

    // Comando não reconhecido
    if (!handled && text.startsWith("!")) {
      await msg.reply("❌ Comando não reconhecido. Digite *!menu*.");
    }

    chat.clearState();
  } catch (err) {
    console.error("Erro no handler:", err);
  }
});

// === INIT ===
(async () => {
  if (isTestMode) return;
  showBanner();
  client.initialize();
})();

module.exports = { client };
