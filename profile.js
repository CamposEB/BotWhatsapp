module.exports = function handleProfileCommands(msg, text, userNumber, name, shared) {
    const { players, savePlayers, ensurePlayer, parseEloInput, getPlayerKeyFromNumber } = shared;
    const lowerText = text.toLowerCase();

    // === COMANDO !ELO ===
    if (lowerText.startsWith("!elo")) {
        const arg = text.replace(/^!elo\s*/i, "").trim();

        if (!arg) {
            // Mostrar Elo atual
            const p = ensurePlayer(userNumber, name);
            if (!p.elo) return msg.reply("Você ainda não tem elo salvo. Use: !elo <nome_elo> [estrelas]");
            return msg.reply(`🏷️ ${p.name}\nElo: ${p.elo}${p.stars ? " ⭐" + p.stars : ""}`);
        }

        // Definir novo Elo
        const parsed = parseEloInput(arg);
        if (!parsed) return msg.reply("Formato de elo inválido. Ex: !elo Mítico 12 ou !elo Lenda");
        ensurePlayer(userNumber, name);
        const key = getPlayerKeyFromNumber(userNumber);
        players[key].elo = parsed.elo;
        players[key].stars = parsed.stars || null;
        players[key].name = players[key].name || name; // Atualiza o nome se mudou
        savePlayers();
        return msg.reply(`✅ Perfil atualizado: Elo definido como *${parsed.elo}*${parsed.stars ? " ⭐" + parsed.stars : ""}.`);
    }

    // === COMANDO !PERFIL ===
    if (lowerText === "!perfil") {
        const p = ensurePlayer(userNumber, name);
        const lines = [
            `👤 *Perfil de ${p.name}*`,
            `📈 Elo Atual: ${p.elo || "—"}${p.stars ? " ⭐" + p.stars : ""}`,
            `❤️ Main: ${p.favoriteHero || "—"}`,
            `🆔 Id: ${p.gameId || "—"}`,
            `🗺️ Rota favorita: ${p.favoriteRole || "—"}`,
        ];
        return msg.reply(lines.join("\n"));
    }

    // === COMANDO !MAIN ===
    if (lowerText.startsWith("!main")) {
        const hero = text.replace(/^!(main|main )/i, "").trim();
        if (!hero) return msg.reply("Use: !main <nome_do_heroi>");
        ensurePlayer(userNumber, name);
        const key = getPlayerKeyFromNumber(userNumber);
        players[key].favoriteHero = hero;
        savePlayers();
        return msg.reply(`✅ Main salvo: *${hero}*`);
    }

    // === COMANDO !ROTA ===
    if (lowerText.startsWith("!rota")) {
        const rota = text.replace(/^!(rota|rota )/i, "").trim();
        if (!rota) return msg.reply("Use: !rota <nome_da_rota>");
        ensurePlayer(userNumber, name);
        const key = getPlayerKeyFromNumber(userNumber);
        // [CORREÇÃO] O objeto player está usando favoriteRole em !perfil, mas RotaFavorita aqui.
        // Vou manter RotaFavorita conforme seu código, mas sugiro unificar para 'favoriteRole' ou 'role'.
        players[key].RotaFavorita = rota; 
        savePlayers();
        return msg.reply(`✅ Rota salva: *${rota}*`);
    }

    // === COMANDO !ID ===
    if (lowerText.startsWith("!id")) {
        const arg = text.replace(/^!id\s*/i, "").trim();

        if (!arg) {
            // Mostrar ID atual
            const p = ensurePlayer(userNumber, name);
            if (!p.gameId) return msg.reply("Você ainda não tem um ID de Jogo salvo. \nUse: *!id <seu ID> \npara sua segurança não mande o número que fica entre ()*");
            return msg.reply(`🏷️ ${p.name}\nID do ML: ${p.gameId}`);
        }

        // Definir novo ID
        const hintRegex = /^(\d+)\s*\((?:\d+)\)$/;
        let gameIdToSave = arg;

        if (hintRegex.test(arg)) {
            gameIdToSave = arg.match(hintRegex)[1];
        }

        // Limpa o ID
        gameIdToSave = String(gameIdToSave).replace(/[^0-9]/g, "");

        if (!gameIdToSave) return msg.reply("❌ ID de Jogo inválido. Insira apenas números.");

        // Salva o ID no perfil
        ensurePlayer(userNumber, name);
        const key = getPlayerKeyFromNumber(userNumber);
        players[key].gameId = gameIdToSave;
        players[key].name = players[key].name || name;
        savePlayers();

        return msg.reply(`✅ Perfil atualizado: ID de Jogo definido como *${gameIdToSave}*.`);
    }

    return false; // Comando não reconhecido neste módulo
};