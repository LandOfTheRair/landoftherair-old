"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    'Rylt Prison Guard'
];
class RyltPrisonGuardSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 900,
            initialSpawn: 5,
            maxCreatures: 5,
            spawnRadius: 3,
            randomWalkRadius: 10,
            leashRadius: 15,
            npcIds
        });
    }
}
exports.RyltPrisonGuardSpawner = RyltPrisonGuardSpawner;
//# sourceMappingURL=rylt-prisonguard.js.map