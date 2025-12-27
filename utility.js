const fs = require("fs");
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require("fluent-ffmpeg");
const fetch = require("node-fetch").default;
const { MessageMedia } = require("whatsapp-web.js");
const path = require("path");

// --- Configurações Persistência Anti-MT ---
const ANTIMT_FILE = path.join(__dirname, '..', 'data', 'antimt.json');

function safeLoadAntiMtList() {
    try {
        if (fs.existsSync(ANTIMT_FILE)) {
            const raw = fs.readFileSync(ANTIMT_FILE, 'utf8').trim();
            if (raw) return new Set(JSON.parse(raw));
        }
    } catch (err) {
        console.error("❌ Erro ao carregar antimt.json:", err.message);
    }
    return new Set();
}

function safeSaveAntiMtList(dataSet) {
    try {
        const arr = [...dataSet];
        const parent = path.dirname(ANTIMT_FILE);
        if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
        fs.writeFileSync(ANTIMT_FILE, JSON.stringify(arr, null, 2));
    } catch (err) {
        console.error("❌ Erro ao salvar antimt.json:", err);
    }
}

// --- Função !casal ---
async function handleCasalCommand(msg, client) {
    const chat = await msg.getChat();
    if (!chat.isGroup) return msg.reply("❌ Este comando só funciona em grupos!");

    const participants = chat.participants
        .map(p => p.id._serialized)
        .filter(id => id !== client.info.me._serialized);

    if (participants.length < 2)
        return msg.reply("⚠️ O grupo precisa de pelo menos 2 pessoas além do bot.");

    const i1 = Math.floor(Math.random() * participants.length);
    let i2;
    do i2 = Math.floor(Math.random() * participants.length);
    while (i2 === i1);

    const p1 = participants[i1];
    const p2 = participants[i2];

    // compatibilidade falsa usando seed simples
    const ids = [p1, p2].sort();
    let seed = ids[0].length + ids[1].length + (new Date().getMonth() + 1);
    for (let i = 0; i < Math.min(ids[0].length, ids[1].length); i++) {
        seed += ids[0].charCodeAt(i) + ids[1].charCodeAt(i);
    }
    const comp = seed % 101;

    let txt = `💖 *TESTE DE COMPATIBILIDADE* 💖\n\n`;
    txt += `@${p1.split("@")[0]} + @${p2.split("@")[0]}\n`;
    txt += `💘 Compatibilidade: *${comp}%*\n\n`;

    if (comp === 100) txt += "💍 Destino escrito! Casamento à vista!";
    else if (comp >= 75) txt += "🥰 Par perfeito! Harmonia total.";
    else if (comp >= 50) txt += "😉 Tem potencial, só alinhar expectativas!";
    else if (comp >= 25) txt += "😅 Pode funcionar… com esforço!";
    else txt += "😔 A química tá fraca… mas tentem em outras vidas.";

    await chat.sendMessage(txt, { mentions: [p1, p2] });
}

// -------------------------------------------------------------------

module.exports = async function handleUtilityCommands(msg, text, shared) {
    const { client, admins, players, ELO_EMOJI, eloWeight, ownerNumber } = shared;

    const lowerText = text.toLowerCase();
    const chat = await msg.getChat();

    // JID do autor
    const authorJid = msg.author || msg.from;

    // Normalizador
    const normalize = n => n ? n.replace(/\D/g, "") : "";
    const cleanAuthor = normalize(authorJid.split("@")[0]);

    // === !chat ===
    if (lowerText === "!chat") {
        const id = chat.id._serialized;

        let resp = `🆔 *JID do Chat:*\n\`${id}\``;
        if (id.endsWith("@g.us")) resp += "\n\nUse este JID na variável *MONITOR_GROUP_JID*.";

        await msg.reply(resp);
        return true;
    }

    // === !antmt ===
    if (lowerText === "!antmt") {
        const list = safeLoadAntiMtList();

        if (list.has(authorJid)) {
            list.delete(authorJid);
            safeSaveAntiMtList(list);
            return msg.reply("🔓 Você saiu da lista anti-marcação.");
        } else {
            list.add(authorJid);
            safeSaveAntiMtList(list);
            return msg.reply("🔒 Você entrou na lista anti-marcação.");
        }
    }

    // === !casal ===
    if (lowerText === "!casal") {
        await handleCasalCommand(msg, client);
        return true;
    }

 // === !mt ===
if (text === "!mt") {
    if (!chat.isGroup)
        return msg.reply("❌ Este comando só pode ser usado em grupos.");

    // ID real do autor
    const author = msg.author;
    const num = author.split("@")[0];

    // Procura o participante no grupo
    const participant = chat.participants.find(p => p.id._serialized === author);

    const isAdminInGroup = participant && (participant.isAdmin || participant.isSuperAdmin);
    const isAdminGlobal = admins.includes(num);

    if (!isAdminInGroup && !isAdminGlobal)
        return msg.reply("🚫 Apenas administradores podem usar este comando.");

    // Lista de menções invisíveis
    const mentions = [];

    for (const p of chat.participants) {
        try {
            const c = await client.getContactById(p.id._serialized);
            mentions.push(c);
        } catch (_) {}
    }

    // Envia mensagem SEM mostrar os @
    return chat.sendMessage("📣 *Chamando todo mundo!*", { mentions });
}



    // === !dias ===
    if (lowerText === "!dias") {
        const hoje = new Date(); hoje.setHours(0,0,0,0);
        const fim = new Date("2025-12-17T00:00:00-03:00");

        const diff = Math.ceil((fim - hoje) / (1000*60*60*24));

        if (diff <= 0) return msg.reply("📆 A temporada acaba hoje!");
        if (diff > 90) return msg.reply("📆 A data ainda não foi atualizada.");
        return msg.reply(`📆 Faltam *${diff} dias* para o fim da temporada.`);
    }

    // === !rank ===
    if (lowerText === "!rank" || lowerText === "!ranking") {
        let list;

        if (chat.isGroup) {
            const groupNums = chat.participants.map(p => p.id.user);
            list = Object.values(players).filter(pl => groupNums.includes(pl.number));
        } else {
            list = Object.values(players);
        }

        if (!list.length) return msg.reply("⚠️ Sem perfis salvos.");

        list.sort((a, b) => eloWeight(b.elo, b.stars || 0) - eloWeight(a.elo, a.stars || 0));
        const top = list.slice(0, 10);

        const lines = top.map((p, i) => {
            const emoji = ELO_EMOJI[p.elo] || "🏅";
            const stars = p.stars ? ` ⭐${p.stars}` : "";
            return `${i+1}️⃣ ${p.name} — ${emoji} ${p.elo}${stars}`;
        });

        return msg.reply(`🏆 *TOP ${top.length} ELO*\n\n${lines.join("\n")}`);
    }

    return false;
};
