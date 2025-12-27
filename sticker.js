// commands/sticker.js
const { MessageMedia } = require("whatsapp-web.js");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Carrega módulo externo makeSticker se existir
let makeSticker = null;
try {
  makeSticker = require("../modules/sticker").makeSticker;
} catch {
  console.log("⚠️ Módulo 'sticker.js' (makeSticker) não encontrado. Usando fallback.");
}

// Handler principal de stickers
module.exports = async function handleStickerCommands(msg, text, shared) {
  const { client } = shared;
  const lower = text.toLowerCase();
  const chat = await msg.getChat();
  const requesterName =
    msg._data?.notifyName ||
    msg._data?.pushName ||
    msg.from?.split("@")[0] ||
    "Usuário";

  const command = lower.split(" ")[0];
  const args = text.split(" ");
  let buffer = null;

  // Comandos válidos (sem !sbg)
  const validCommands = ["!s", "!snome", "!scustom"];
  if (!validCommands.includes(command)) return false;

  // Obtém mídia de URL, mensagem ou reply
  if (args[1] && args[1].startsWith("http")) {
    try {
      const res = await axios.get(args[1], { responseType: "arraybuffer" });
      buffer = Buffer.from(res.data);
    } catch {
      return msg.reply("❌ Não consegui baixar a imagem da URL.");
    }
  }

  if (!buffer && msg.hasMedia) {
    try {
      const media = await msg.downloadMedia();
      buffer = Buffer.from(media.data, "base64");
    } catch {
      return msg.reply("❌ Erro ao baixar a mídia enviada.");
    }
  }

  if (!buffer && msg.hasQuotedMsg) {
    try {
      const quoted = await msg.getQuotedMessage();
      if (quoted.hasMedia) {
        const media = await quoted.downloadMedia();
        buffer = Buffer.from(media.data, "base64");
      }
    } catch (err) {
      console.error("Erro reply:", err);
      return msg.reply("❌ Não consegui baixar a mídia respondida.");
    }
  }

  if (!buffer) {
    return msg.reply(
      `📸 Use *${command}* enviando ou respondendo uma imagem. Use *!snome Pack|Author* para personalizar.`
    );
  }

  // Valores padrão
  let packName = "🤖 DESTINY BOT";
  let author = `📩 Solicitado por: ${requesterName}`;

  // Comando !snome
  if (command === "!snome") {
    const customText = text.substring(command.length).trim();
    if (customText.includes("|")) {
      const parts = customText.split("|").map((p) => p.trim());
      packName = parts[0] || packName;
      author = parts[1] ? `📩 *${parts[1]}*` : author;
    } else if (customText.length > 0) {
      packName = customText;
      author = `📩 Solicitado por: ${requesterName}`;
    }
  }

  try {
    let stickerBuffer;

    if (command === "!scustom") {
      let size = parseInt(args[1]) || 512;
      if (size > 1024) size = 1024;
      if (size < 128) size = 128;
      stickerBuffer = await sharp(buffer)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ lossless: true })
        .toBuffer();
    } else if (makeSticker) {
      stickerBuffer = await makeSticker(buffer, packName, author);
    } else {
      // !s e !snome → Sharp garante WebP válido
      stickerBuffer = await sharp(buffer)
        .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ lossless: true })
        .toBuffer();
    }

    const stickerMedia = new MessageMedia("image/webp", stickerBuffer.toString("base64"));
    await client.sendMessage(chat.id._serialized, stickerMedia, {
      sendMediaAsSticker: true,
      stickerAuthor: author,
      stickerName: packName,
    });

    return true;
  } catch (err) {
    console.error("Erro no sticker:", err);
    return msg.reply("❌ Erro ao criar sticker.");
  }
};
