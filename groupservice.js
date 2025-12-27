// services/groupservice.js
const fs = require("fs");
const path = require("path");

const GROUPS_FILE = path.join(__dirname, "../data/groups.json");

/**
 * Carrega todos os grupos do arquivo
 */
function loadGroups() {
    if (!fs.existsSync(GROUPS_FILE)) return [];

    try {
        const data = JSON.parse(fs.readFileSync(GROUPS_FILE, "utf8"));
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Erro ao ler groups.json:", err);
        return [];
    }
}

/**
 * Salva todos os grupos no arquivo
 */
function saveGroups(groups) {
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
}

/**
 * Adiciona ou atualiza um grupo
 * Corrige automaticamente o total de participantes
 */
function upsertGroup(group) {
    if (!group || !group.id) return;

    const groups = loadGroups();
    const index = groups.findIndex(g => g.id === group.id);

    // Calcula total de participantes corretamente
    const totalParticipants =
        Array.isArray(group.participants?.users)
            ? group.participants.users.length
            : group.participants?.total || 0;

    const normalizedGroup = {
        id: group.id,
        name: group.name || "Grupo sem nome",
        description: group.description || "",
        owner: group.owner || null,
        iconUrl: group.iconUrl || null,
        participants: {
            users: group.participants?.users || [],
            total: totalParticipants
        },
        updatedAt: new Date().toISOString(),
        createdAt: group.createdAt || new Date().toISOString()
    };

    if (index === -1) {
        groups.push(normalizedGroup);
    } else {
        groups[index] = {
            ...groups[index],
            ...normalizedGroup
        };
    }

    saveGroups(groups);
}

/**
 * Retorna todos os grupos
 */
function getAllGroups() {
    return loadGroups();
}

module.exports = {
    upsertGroup,
    getAllGroups
};
