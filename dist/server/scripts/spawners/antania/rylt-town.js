"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    'Rylt Guard',
    'Rylt Townee'
];
const paths = [
    '34-E 6-S 34-W 6-N',
    '6-S 34-E 6-N 34-W'
];
class RyltTownSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 15,
            initialSpawn: 3,
            maxCreatures: 15,
            spawnRadius: 0,
            randomWalkRadius: 0,
            leashRadius: 35,
            npcIds,
            paths
        });
    }
}
exports.RyltTownSpawner = RyltTownSpawner;
//# sourceMappingURL=rylt-town.js.map