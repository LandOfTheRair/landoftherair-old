"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    { chance: 4, result: 'Rylt Deer' },
    { chance: 2, result: 'Rylt Wolf' },
    { chance: 1, result: 'Rylt Bear' }
];
class RyltForestMonsterSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 30,
            initialSpawn: 2,
            maxCreatures: 7,
            spawnRadius: 4,
            randomWalkRadius: 15,
            leashRadius: 25,
            npcIds
        });
    }
}
exports.RyltForestMonsterSpawner = RyltForestMonsterSpawner;
//# sourceMappingURL=rylt-forest.js.map