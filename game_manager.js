const dbManager = require('./db_manager.js')
const INITIAL_COHERENCE = 20

const missionsTypes = [
    'SECURITY',
    'DATA',
    'COMPUTING',
    'CLEANING'
]

class IA {
    constructor(birthDate, creator) {
        this.birthDate = birthDate
        this.deathDate = null
        this.coherence = INITIAL_COHERENCE
        this.cycle
        this.cycleLevel
        this.id
        this.creator = creator
    }

    async die() {
        await dbManager.deathIA(this.deathDate)
    }
}

class Cycle {
    constructor(level, coherence) {
        this.level = level
        this.birthDate = Date.now()
        this.missions = this.createMissions(coherence)
        this.totalMissions = this.missions.length
        this.duration = (60 - coherence*2) * 60000
    }

    createMissions(coherence) {
        let result = []
        let maxMissions = getRandomInt(this.level + 1) + INITIAL_COHERENCE - coherence
        let missionsNumber = Math.random(1, maxMissions)
        
        for (let i=0; i < missionsNumber; i++) {
            result.push(missionsTypes[getRandomInt(missionsTypes.length)])
        }

        return result
    }

    completeMission(type) {
        let index = this.missions.findIndex(el => el == type)
        this.missions.slice(index)
    }


    toJSON() {
        return {
            level: this.level,
            birthDate: this.birthDate,
            missions: this.missions,
            totalMissions: this.totalMissions,
            duration: this.duration,
            timeLeft: this.birthDate + this.duration - Date.now()
        }
    }
}

class GameManager {
    currentLog
    currentIA
    cycleTimer

    constructor() {
        this.loadLastIA()
    }
    
    async newIA(creator) {
        this.currentIA = new IA(Date.now(), creator)
        this.currentIA.id = await dbManager.newIA(this.currentIA)
        this.currentLog = []
        this.currentLog.push(makeLog(creator + ' started a new IA', creator))
        this.newCycle(1)
    }

    async loadLastIA() {
        this.currentIA = await dbManager.lastIA()
        if(this.currentIA != null){
            this.currentIA.cycle = new Cycle(this.currentIA.cycleLevel, this.currentIA.coherence)
        }
    }

    endIA() {
        this.currentIA.deathDate = Date.now()
        this.currentLog.push('IA ' + this.currentIA.id + ' died')
        this.currentIA.die()
    }

    newCycle(level) {
        this.currentIA.cycle = new Cycle(level, this.currentIA.coherence)
        this.currentLog.push(makeLog('cycle ' + this.currentIA.cycle.level + ' started'))
        dbManager.updateCycleLevel(level, this.currentIA.id)

        this.cycleTimer = setTimeout(() => {
            this.endCycle()
        }, this.currentIA.cycle.duration)
    }

    endCycle() {
        this.currentIA.coherence--

        if (this.currentIA.coherence == 0) {
            this.endIA()
        }

        this.newCycle(this.currentIA.cycle.level + 1)
    }

    completeMission(type, iaID, cycleLevel, player) {
        if (iaID == this.currentIA.id && cycleLevel == this.currentIA.cycle.level) {
            this.currentIA.cycle.completeMission(type)
            this.currentLog.push(makeLog(player + ' completed ' + type + ' mission', player))

            if (this.currentIA.cycle.missions.length == 0) {
                clearTimeout(this.cycleTimer)
                this.newCycle()
            }
        }
        // TODO : informer que la mission a deja ete realisee / que le cycle est deja passe
    }

    getLogs(limit) {
        limit > this.currentLog.length ? limit = 0 : limit = this.currentLog.length - limit
        return this.currentLog.slice(limit, this.currentLog.length)
    }

    reset() {
        this.currentIA = null
        this.currentLog = null
        clearTimeout(this.cycleTimer)
    }

    get currentIA() {
        this.currentIA.cycle.updateTimeLeft()
        return this.currentIA
    }
}

function makeLog(content, player) {
    let time = new Date().toTimeString()
    return {time: time, content: content, player: player ? player : null}
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(3))
}

module.exports.GameManager = GameManager
module.exports.IA = IA;