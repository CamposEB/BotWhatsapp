// === LOGGER COLORIDO PROFISSIONAL === //
// Cores ANSI
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const FG_GREEN = "\x1b[32m";
const FG_CYAN = "\x1b[36m";
const FG_MAGENTA = "\x1b[35m";
const FG_GRAY = "\x1b[90m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const FG_BLUE = "\x1b[34m";
const FG_WHITE = "\x1b[37m";
const FG_BRIGHT_GREEN = "\x1b[92m";

const BG_CYAN = "\x1b[46m";
const BG_GRAY = "\x1b[100m";
const BG_MAGENTA = "\x1b[45m";
const BG_GREEN = "\x1b[42m";
const BG_RED = "\x1b[41m";
const BG_YELLOW = "\x1b[43m";

// Mapa de categorias para cores e rótulos
const LABELS = {
    INFO:        { text: "INFO",          color: BG_GREEN },
    MENU:        { text: "MENU",          color: BG_CYAN },
    ADMIN:       { text: "ADMINISTRAÇÃO", color: BG_GRAY },
    STICKER:     { text: "STICKER",       color: BG_MAGENTA },
    PROFILE:     { text: "PERFIL",        color: BG_CYAN },
    MATCH:       { text: "PARTIDA",       color: BG_CYAN },
    UTILITY:     { text: "UTILITÁRIO",    color: BG_CYAN },
    COMMAND:     { text: "COMANDO",       color: BG_CYAN },
    ERROR:       { text: "ERRO",          color: BG_RED },
    WARNING:     { text: "AVISO",         color: BG_YELLOW }
};

// ===== Função Principal do Logger ===== //
function log(category, message, options = {}) {
    const cfg = LABELS[category] || LABELS["INFO"];
    const catLabel = `${cfg.color}${BOLD} ${cfg.text} ${RESET}`;

    const timestamp = new Date().toLocaleString("pt-BR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    let finalMsg =
        `${FG_GREEN}~>${RESET} ` +
        `${catLabel} ` +
        `${FG_GRAY}${timestamp}${RESET} ` +
        `${message}`;

    if (options.time)
        finalMsg += ` ${FG_CYAN}(${options.time.toFixed(2)}s)${RESET}`;

    console.log(finalMsg);
}

module.exports = {
    log
};
