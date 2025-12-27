const fs = require('fs');

module.exports = function handleSuggestionCommand(text, msg, name, contact) {
    if (/^sugest(ão|ion):/i.test(text)) {
        const suggestion = text.replace(/^sugest(ão|ion):/i, "").trim();
        fs.appendFileSync("./suggestions.txt", `${new Date().toISOString()} | ${contact.pushname || name} | ${suggestion}\n`);
        msg.reply("✅ Sugestão registrada! Obrigado.");
        return true;
    }
    return false;
};