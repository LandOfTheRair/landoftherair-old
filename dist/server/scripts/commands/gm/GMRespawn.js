"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../base/Command");
class GMRespawn extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@respawn';
        this.format = 'LairName';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            if (!args)
                return false;
            const spawner = lodash_1.find(room.allSpawners, checkSpawner => lodash_1.includes(checkSpawner.npcIds, args));
            if (!spawner)
                return player.sendClientMessage('That lair does not exist.');
            spawner.createNPC();
            spawner.currentTick = 0;
        });
    }
}
exports.GMRespawn = GMRespawn;
//# sourceMappingURL=GMRespawn.js.map