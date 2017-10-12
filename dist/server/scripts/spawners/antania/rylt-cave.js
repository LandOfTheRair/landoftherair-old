"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    { chance: 2, result: 'Rylt Rockgolem' },
    { chance: 1, result: 'Rylt Cave Apprentice' }
];
class RyltCaveMonsterSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 15,
            initialSpawn: 2,
            maxCreatures: 7,
            spawnRadius: 1,
            randomWalkRadius: 15,
            leashRadius: 25,
            npcIds
        });
    }
}
exports.RyltCaveMonsterSpawner = RyltCaveMonsterSpawner;
//# sourceMappingURL=rylt-cave.js.map