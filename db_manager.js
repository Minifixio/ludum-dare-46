var sq = require('sqlite3')
var mainDb = new sq.Database(__dirname + '/db/main.db')
var IA = require('./game_manager.js').IA

async function newIA(ia) {
    return new Promise((resolve) => {
        const query = 'INSERT INTO ia(birthDate, creator, coherence, currentCycle) VALUES(?, ?, ?, ?)'

        mainDb.run(query, [ia.birthDate, ia.creator, ia.coherence, ia.currentCycle], function() {
            resolve(this.lastID)
        })
    })
}

async function lastIA() {
    return new Promise((resolve) => {
        const query = 'SELECT * FROM ia ORDER BY id DESC LIMIT 1'

        mainDb.get(query, [], (err, row) => {
            // Si deathDate !== null, la derniere IA est morte
            if (row == null || row.deathDate != null) {
                resolve(null)
            } else {
                let ia = new IA(row.birthDate, row.creator)
                ia.coherence = row.coherence
                ia.deathDate = row.deathDate
                ia.id = row.id
                ia.cycleLevel = row.cycleLevel
                resolve(ia)
            }
        })
    })
}

async function updateCycleLevel(cycleLevel, iaID) {
    return new Promise((resolve) => {
        const query = 'UPDATE ia SET currentCycle = ? WHERE id = ?'
        mainDb.run(query, [cycleLevel, iaID], () => {
            resolve()
        })
    })
}

function resetDb() {
    mainDb.run('DELETE FROM ia')
}

function deathIA(deathDate) {
    const query = 'UPDATE ia SET deathDate = ? WHERE id = (SELECT MAX(id) FROM ia)'
    mainDb.run(query, [deathDate])
}

function lowCoherence() {
    const query = 'UPDATE ia SET coherence = coherence - 1 WHERE id = (SELECT MAX(id) FROM ia)'
    mainDb.run(query)
}

module.exports.lowCoherence = lowCoherence;
module.exports.updateCycleLevel = updateCycleLevel;
module.exports.resetDb = resetDb
module.exports.deathIA = deathIA
module.exports.lastIA = lastIA
module.exports.newIA = newIA