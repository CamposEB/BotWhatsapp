const { MessageMedia } = require("whatsapp-web.js");
const path = require("path");
const fs = require("fs");

async function sendBanner(msg, caption) {
  const bannerPath = path.join(__dirname, "../assets/banner.jpg");

  if (!fs.existsSync(bannerPath)) {
    return msg.reply(caption);
  }

  const media = MessageMedia.fromFilePath(bannerPath);
  return msg.reply(media, null, { caption });
}

module.exports = { sendBanner };
