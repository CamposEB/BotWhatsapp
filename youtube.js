const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { MessageMedia } = require("whatsapp-web.js");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

// Mapa temporário para armazenar buscas por usuário
const searchMap = {};

module.exports = async function handleYouTubeCommands(msg, text, shared) {
  const { client } = shared;
  const lower = text.toLowerCase();
  const args = text.split(" ");
  const command = args[0];

  const userId = msg.from;

  // Comando !buscar
  if (command === "!buscar") {
    const query = args.slice(1).join(" ");
    if (!query) return msg.reply("❌ Use: !buscar <nome do vídeo>");

    const r = await ytSearch(query);
    const videos = r.videos.slice(0, 1); // pega o primeiro resultado
    if (!videos.length) return msg.reply("❌ Nenhum vídeo encontrado.");

    const video = videos[0];

    // Armazena no mapa
    searchMap[userId] = video;

    await msg.reply(
      `🔎 Encontrei este vídeo:\n\n` +
      `🎬 Título: ${video.title}\n` +
      `⏱ Duração: ${video.timestamp}\n` +
      `🌐 Link: ${video.url}\n\n` +
      `Se for este, responda com *!play* para receber o áudio em MP3.`
    );

    return true;
  }

  // Comando !play
  if (command === "!play") {
    let video = null;

    if (args.length > 1) {
      // Pesquisa diretamente se o usuário passou o nome
      const query = args.slice(1).join(" ");
      const r = await ytSearch(query);
      video = r.videos[0];
      if (!video) return msg.reply("❌ Nenhum vídeo encontrado.");
    } else {
      // Usa a última busca do mesmo usuário
      video = searchMap[userId];
      if (!video) return msg.reply("❌ Nenhum vídeo encontrado para reproduzir. Use !buscar <nome> primeiro.");
    }

    // Baixar áudio
    const tempDir = path.resolve("./temp/youtube");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const outputPath = path.join(tempDir, `audio_${Date.now()}.mp3`);

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(ytdl(video.url, { quality: "highestaudio" }))
          .audioBitrate(128)
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

      const media = MessageMedia.fromFilePath(outputPath);
      await client.sendMessage(msg.from, media, { sendAudioAsVoice: false });

      fs.unlinkSync(outputPath);
      return true;

    } catch (err) {
      console.error("Erro ao baixar/converter vídeo:", err);
      return msg.reply("❌ Erro ao baixar ou converter o vídeo.");
    }
  }

  return false;
};
