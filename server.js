// server.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { getAllGroups } = require("./services/groupservice");
const { safeLoadJSON } = require("./utils/general.util"); // Carrega players e stats
const expressLayouts = require("express-ejs-layouts");

// Inicializa o app
const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do Express
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// ========================
// Rotas do site
// ========================

// Página inicial / Home
app.get("/", (req, res) => {
    const groups = getAllGroups(); // retorna array de grupos
    const players = safeLoadJSON("./data/players.json") || {};
    const userStats = safeLoadJSON("./data/userStats.json") || {};

    const totalMembers = groups.reduce((acc, g) => acc + (g.participants?.total || 0), 0);
    const totalCommands = Object.values(userStats).reduce((acc, u) => acc + (u.commands || 0), 0);

    res.render("index", { groups, totalMembers, totalCommands, players });
});

// Página de todos os grupos
app.get("/groups", (req, res) => {
    const groups = getAllGroups();
    res.render("groups", { groups });
});

// Página de membros de um grupo específico
app.get("/members/:id", (req, res) => {
    const groups = getAllGroups();
    const group = groups.find(g => g.id === req.params.id);
    if (!group) return res.status(404).send("Grupo não encontrado.");
    res.render("members", { group });
});

// Página de comandos disponíveis
app.get("/commands", (req, res) => {
    res.render("commands"); // template commands.ejs
});

// ========================
// Start do servidor
// ========================
app.listen(PORT, () => console.log(`🌐 Site do Bot rodando em http://localhost:${PORT}`));
