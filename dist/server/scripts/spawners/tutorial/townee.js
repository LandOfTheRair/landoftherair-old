"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const paths = [
    '23-E 16-S 23-W 16-N',
    '16-S 23-E 16-N 23-W',
    '8-S 23-E 8-S 23-W 8-N 23-E 8-N 23-W',
    '23-E 8-S 23-W 8-S 23-E 8-N 23-W 8-N'
];
const npcIds = [
    'Tutorial Townee'
];
class TutorialTowneeSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 15,
            initialSpawn: 2,
            maxCreatures: 20,
            spawnRadius: 0,
            randomWalkRadius: 0,
            leashRadius: 30,
            paths,
            npcIds
        });
    }
}
exports.TutorialTowneeSpawner = TutorialTowneeSpawner;
//# sourceMappingURL=townee.js.map