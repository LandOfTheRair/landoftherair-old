"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spawner_1 = require("../../../base/Spawner");
const lodash_1 = require("lodash");
class LairSpawner extends Spawner_1.Spawner {
    constructor(room, opts, properties) {
        const spawnerProps = lodash_1.extend({
            respawnRate: 3600,
            initialSpawn: 1,
            maxSpawn: 1,
            spawnRadius: 0,
            randomWalkRadius: 2,
            leashRadius: 10,
            shouldSerialize: true,
            alwaysSpawn: true,
            requireDeadToRespawn: true,
            shouldStrip: true,
            stripOnSpawner: true
        }, properties);
        spawnerProps.npcIds = [properties.lairName];
        super(room, opts, spawnerProps);
    }
}
exports.LairSpawner = LairSpawner;
//# sourceMappingURL=lair.js.map