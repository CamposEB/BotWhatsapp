
module.exports = function handleCustomMatchCommands(msg, text, userNumber, chatId, shared, name, contact) {
    const { admins, matches, players, saveMatches, ensurePlayer, getPlayerKeyFromNumber } = shared;
    const lowerText = text.toLowerCase();

    // === COMANDO !PERSONALIZADA (Apenas Admins do Bot) ===
    if (lowerText.startsWith("!personalizada")) {
        if (!admins.includes(userNumber)) return msg.reply("🚫 Apenas administradores do bot podem criar partidas personalizadas.");
        const arg = text.replace(/^!personalizada\s*/i, "").trim() || "horario não informado";
        
        matches[chatId] = {
            host: userNumber,
            hostName: contact.pushname || name,
            time: arg,
            teams: { "1": [], "2": [] },
            maxPerTeam: 5,
            createdAt: new Date().toISOString(),
        };
        
        saveMatches();
        return msg.reply(`✅ Partida personalizada criada para *${arg}*.\nJogadores podem entrar com: !time 1 ou !time 2\nHost: ${contact.pushname || name}`);
    }

    // === COMANDO !TIME 1 ou !TIME 2 ===
    if (/^!time\s+[12]$/i.test(text)) {
        const which = text.replace(/^!time\s*/i, "").trim();
        if (!matches[chatId]) return msg.reply("❌ Não há partida personalizada ativa neste chat. Crie com !personalizada <hora> (somente admins).");
        
        const match = matches[chatId];
        const key = getPlayerKeyFromNumber(userNumber);

        // Remove o jogador de qualquer time que ele possa estar
        for (const t of ["1", "2"]) {
            match.teams[t] = match.teams[t].filter((n) => n !== key);
        }

        if (match.teams[which].length >= match.maxPerTeam) return msg.reply(`❌ Time ${which} já está cheio.`);
        
        // Adiciona ao novo time
        match.teams[which].push(key);
        ensurePlayer(userNumber, name);
        saveMatches();

        const total = match.teams["1"].length + match.teams["2"].length;
        
        // Confirma e remove a partida se estiver cheia
        if (total >= match.maxPerTeam * 2) {
            const t1 = match.teams["1"].map((k) => players[k]?.name || k).join(", ");
            const t2 = match.teams["2"].map((k) => players[k]?.name || k).join(", ");
            delete matches[chatId];
            saveMatches();
            return msg.reply(`✅ Partida personalizada confirmada para *${match.time}*!\n\n🔵 Time 1: ${t1}\n🔴 Time 2: ${t2}`);
        }

        return msg.reply(`✅ Você entrou no Time ${which}.\nUse !times para ver a lista.`);
    }

    // === COMANDO !TIMES ===
    if (lowerText === "!times") {
        if (!matches[chatId]) return msg.reply("❌ Não há partida personalizada ativa neste chat.");
        
        const m = matches[chatId];
        
        const t1 = Array.from({length: m.maxPerTeam}, (_,i) => m.teams["1"][i] ? (players[m.teams["1"][i]]?.name || m.teams["1"][i]) : "— vaga —").join("\n");
        const t2 = Array.from({length: m.maxPerTeam}, (_,i) => m.teams["2"][i] ? (players[m.teams["2"][i]]?.name || m.teams["2"][i]) : "— vaga —").join("\n");
        
        return msg.reply(`⚔️ PARTIDA — ${m.time}\nHost: ${m.hostName}\n\n🔵 Time 1:\n${t1}\n\n🔴 Time 2:\n${t2}`);
    }

    // === COMANDO !CANCELAR ===
    if (lowerText === "!cancelar") {
        if (!matches[chatId]) return msg.reply("❌ Não há partida para cancelar.");
        
        const m = matches[chatId];
        if (m.host !== userNumber) return msg.reply("🚫 Apenas o criador/host pode cancelar esta partida.");
        
        delete matches[chatId];
        saveMatches();
        
        return msg.reply("✅ Partida cancelada pelo host.");
    }

    return false; // Comando não reconhecido neste módulo
};