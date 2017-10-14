"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    'Rylt Renegade',
    'Rylt Renegade Mage',
    'Rylt Renegade Healer'
];
class RyltRenegadeMonsterSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 45,
            initialSpawn: 1,
            maxCreatures: 6,
            spawnRadius: 1,
            randomWalkRadius: 25,
            leashRadius: 35,
            npcIds
        });
    }
}
exports.RyltRenegadeMonsterSpawner = RyltRenegadeMonsterSpawner;
//# sourceMappingURL=rylt-renegade.js.map