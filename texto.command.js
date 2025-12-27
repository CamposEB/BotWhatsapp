const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async function handleTexto(msg) {
  try {
    if (!msg.hasQuotedMsg) {
      await msg.reply("❌ Responda um áudio com *!texto*.");
      return true;
    }

    const quoted = await msg.getQuotedMessage();
    if (!quoted.hasMedia) {
      await msg.reply("❌ A mensagem respondida não contém áudio.");
      return true;
    }

    const media = await quoted.downloadMedia();
    if (!media) {
      await msg.reply("❌ Erro ao baixar o áudio.");
      return true;
    }

    // Garante pasta temp
    const tempDir = path.resolve("./temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const base = `audio_${Date.now()}`;
    const oggPath = path.join(tempDir, `${base}.ogg`);
    const wavPath = path.join(tempDir, `${base}.wav`);
    const normWavPath = path.join(tempDir, `${base}_norm.wav`);

    fs.writeFileSync(oggPath, Buffer.from(media.data, "base64"));

    // OGG → WAV (ideal para Whisper)
    await new Promise((resolve, reject) => {
      ffmpeg(oggPath)
        .audioChannels(1)        // mono
        .audioFrequency(16000)   // padrão Whisper
        .audioCodec("pcm_s16le") // codec ideal
        .toFormat("wav")
        .on("end", resolve)
        .on("error", reject)
        .save(normWavPath);
    });

    await msg.reply("🧠 Transcrevendo áudio, aguarde...");

    // Define TXT path correto
    const txtPath = normWavPath.replace(".wav", ".txt");
    console.log("Arquivo de saída esperado:", txtPath);

    // Whisper LOCAL (SEM API, SEM CUSTO)
    exec(
      `python -m whisper "${normWavPath}" `
      + `--model medium `
      + `--language Portuguese `
      + `--task transcribe `
      + `--beam_size 5 `
      + `--best_of 5 `
      + `--fp16 False `
      + `--condition_on_previous_text False `
      + `--output_format txt `
      + `--output_dir "${tempDir}"`,
      async (err) => {
        try {
          if (err) {
            console.error("Erro Whisper:", err);
            await msg.reply("❌ Erro ao transcrever o áudio.");
            return;
          }

          if (!fs.existsSync(txtPath)) {
            await msg.reply("⚠️ O áudio não gerou texto.");
            return;
          }

          const text = fs.readFileSync(txtPath, "utf8").trim();

          if (!text) {
            await msg.reply("⚠️ Não foi possível identificar fala no áudio.");
          } else {
            await msg.reply(`📝 *Texto do áudio:*\n\n${text}`);
          }

        } finally {
          // Limpeza segura
          [oggPath, wavPath, normWavPath, txtPath].forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
          });
        }
      }
    );

    return true;

  } catch (err) {
    console.error("Erro no !texto:", err);
    await msg.reply("❌ Erro ao processar o áudio.");
    return true;
  }
};
