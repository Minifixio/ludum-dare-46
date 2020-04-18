var express = require('express')
var app = express()
app.use(express.json())
const dbManager = require('./db_manager.js')
const GameManagerClass = require('./game_manager.js').GameManager
const gameManager = new GameManagerClass()

// Creation nouvelle IA
app.post('/api/ia', async function(req, res) {
    let lastIA = await dbManager.lastIA() // Return false si la derniere IA est morte

    if (lastIA == null || lastIA.deathDate !== null) {
        await gameManager.newIA(req.body.player) // A définir le type d'envoi des requetes
    }
    res.send(gameManager.currentIA)
});

// Recuperer l'IA courante
app.get('/api/ia', async function(req, res) {
    res.send(gameManager.currentIA)
});

app.put('/api/mission/:ia/:cycle', function(req, res) {
    gameManager.completeMission(req.body.type, req.params.ia, req.params.cycle, req.body.player)
    res.send(true)
});

app.get('/api/log', function(req, res) {
    res.send(gameManager.getLogs(100))
});

app.get('/api/dev/dump', function(req, res) {
    res.send({
        currentIA: gameManager.currentIA,
        currentMissions: gameManager.currentMissions
    })
});

app.get('/api/dev/reset', function(req, res) {
    dbManager.resetDb()
    gameManager.reset()
    res.send(true)
});

app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port 3000!')
});