const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertToMp3(inputPath) {
    return new Promise((resolve, reject) => {
        const outputPath = inputPath.replace(/\.\w+$/, ".mp3");

        ffmpeg(inputPath)
            .toFormat("mp3")
            .on("error", reject)
            .on("end", () => resolve(outputPath))
            .save(outputPath);
    });
}

module.exports = { convertToMp3 };
