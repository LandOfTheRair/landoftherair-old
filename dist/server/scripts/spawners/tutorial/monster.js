"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    'Tutorial Deer',
    'Tutorial Wolf'
];
class TutorialMonsterSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 15,
            initialSpawn: 2,
            maxCreatures: 6,
            spawnRadius: 1,
            randomWalkRadius: 5,
            leashRadius: 10,
            npcIds
        });
    }
}
exports.TutorialMonsterSpawner = TutorialMonsterSpawner;
//# sourceMappingURL=monster.js.map