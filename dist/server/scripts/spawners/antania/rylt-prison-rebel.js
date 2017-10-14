"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const npcIds = [
    'Rylt Renegade Rebel',
    'Rylt Renegade Mage Rebel',
    'Rylt Renegade Healer Rebel',
    'Rylt Renegade Rebel Thief'
];
class RyltPrisonRebelSpawner extends Spawner_1.Spawner {
    constructor(room, opts) {
        super(room, opts, {
            respawnRate: 20,
            initialSpawn: 1,
            maxCreatures: 5,
            spawnRadius: 0,
            randomWalkRadius: 15,
            leashRadius: 25,
            npcIds
        });
    }
}
exports.RyltPrisonRebelSpawner = RyltPrisonRebelSpawner;
//# sourceMappingURL=rylt-prison-rebel.js.map