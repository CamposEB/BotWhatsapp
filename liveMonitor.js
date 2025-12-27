// liveMonitor.js
const fetch = require("node-fetch").default;
require("dotenv").config();

// --- Configurações de Monitoramento ---
const STREAMER_ID = process.env.MONITOR_STREAMER_ID || "UCEQSebrIWJT6-V5eoAv6WPQ";
const GROUP_JID = process.env.MONITOR_GROUP_JID || "120363423283956765@g.us";

// Variável para rastrear o último status conhecido da live
let lastStatus = "offline";

/** Verifica o status da live no YouTube */
async function checkYouTubeStatus() {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
        console.error("❌ YOUTUBE_API_KEY não configurada no .env");
        return { isLive: false, title: "Erro de Chave API" };
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${STREAMER_ID}&type=video&eventType=live&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) {
            console.error("❌ Erro na API do YouTube:", data);
            return { isLive: false, title: "Erro de API" };
        }

        const isLive = data?.items?.length > 0;
        const title = isLive ? data.items[0].snippet.title : null;
        return { isLive, title };

    } catch (error) {
        console.error("❌ Erro de rede ao checar status do YouTube:", error.message);
        return { isLive: false, title: "Erro de Rede" };
    }
}

/** Checa o status da live e envia notificação se estiver online */
async function checkLiveStatus(client) {
    if (!client || !client.isReady) return;

    try {
        const status = await checkYouTubeStatus();
        const isLive = status.isLive;

        if (isLive && lastStatus === "offline") {
            // A live acabou de iniciar
            const platformLink = `https://youtube.com/channel/${STREAMER_ID}/live`;
            const message = `🔴 *LIVE ONLINE!* 🔴\n\n` +
                            `O canal iniciou uma transmissão no YouTube!\n\n` +
                            `*Título:* ${status.title || 'Sem título'}\n\n` +
                            `🔗 Assista agora: ${platformLink}`;

            await client.sendMessage(GROUP_JID, message);
            console.log(`✅ Notificação de Live enviada para ${GROUP_JID}.`);
        } else if (!isLive && lastStatus === "online") {
            console.log(`ℹ️ Live de ${STREAMER_ID} ficou offline.`);
        }

        // Atualiza status
        lastStatus = isLive ? "online" : "offline";

    } catch (error) {
        console.error("❌ Erro no monitor de live:", error.message);
    }
}

// Exporta função e constantes
module.exports = {
    checkLiveStatus,
    GROUP_JID,
    STREAMER_ID
};
