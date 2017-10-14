"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    'Rylt Renegade Prisoner'
];
class RyltPrisonMonsterSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 20,
            initialSpawn: 1,
            maxCreatures: 5,
            spawnRadius: 0,
            randomWalkRadius: 25,
            leashRadius: 35,
            npcIds
        });
    }
}
exports.RyltPrisonMonsterSpawner = RyltPrisonMonsterSpawner;
//# sourceMappingURL=rylt-prison.js.map