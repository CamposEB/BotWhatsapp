// utils/general.util.js
const chalk = require("chalk");
const qrcode = require("qrcode-terminal");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

/**
 * Carrega um JSON de forma segura
 * @param {string} filePath 
 * @returns {Object}
 */
function safeLoadJSON(filePath) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(fullPath, "utf8"));
    } catch (e) {
        console.error(`Erro ao carregar JSON: ${fullPath}`, e);
        return {};
    }
}

/**
 * Salva um objeto em JSON
 * @param {string} filePath 
 * @param {Object} data 
 */
function saveJSON(filePath, data) {
    const fullPath = path.resolve(filePath);
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

/**
 * Função de log com cores
 * @param {"INFO"|"WARN"|"ERROR"} level 
 * @param {string} message 
 */
function log(level, message) {
    const timestamp = new Date().toLocaleString();
    switch (level) {
        case "INFO":
            console.log(`${chalk.blue("~>")} ${chalk.green(level)} ${chalk.gray(timestamp)} ${message}`);
            break;
        case "WARN":
            console.log(`${chalk.yellow("~>")} ${chalk.yellow(level)} ${chalk.gray(timestamp)} ${message}`);
            break;
        case "ERROR":
            console.log(`${chalk.red("~>")} ${chalk.red(level)} ${chalk.gray(timestamp)} ${message}`);
            break;
        default:
            console.log(`${chalk.gray("~>")} ${level} ${chalk.gray(timestamp)} ${message}`);
    }
}

/**
 * Mostra QR Code no terminal
 * @param {string} qr 
 */
function showQRCode(qr) {
    qrcode.generate(qr, { small: true });
}

/**
 * Função de delay
 * @param {number} ms 
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Função para perguntar algo no terminal
 * @param {string} question 
 * @returns {Promise<string>}
 */
function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(question, answer => {
        rl.close();
        resolve(answer.trim());
    }));
}

/**
 * Colorir texto
 * @param {string} text 
 * @param {"red"|"green"|"yellow"|"blue"|"magenta"|"cyan"|"white"} color 
 * @returns {string}
 */
function colorText(text, color) {
    if (!chalk[color]) return text;
    return chalk[color](text);
}

/**
 * Cria texto simples de menu
 * @param {string} title 
 * @param {Array<string>} options 
 * @returns {string}
 */
function buildMenu(title, options) {
    let menu = `─── ${title} ───\n`;
    options.forEach((opt, i) => {
        menu += `${i + 1}. ${opt}\n`;
    });
    return menu;
}

module.exports = {
    safeLoadJSON,
    saveJSON,
    log,
    showQRCode,
    delay,
    askQuestion,
    colorText,
    buildMenu
};
