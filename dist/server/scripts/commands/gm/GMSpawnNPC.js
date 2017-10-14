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
const Command_1 = require("../../../base/Command");
const lodash_1 = require("lodash");
const Spawner_1 = require("../../../base/Spawner");
const npc_loader_1 = require("../../../helpers/npc-loader");
class GMSpawnNPC extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@spawnnpc';
        this.format = 'Props...';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            if (!args)
                return false;
            const mergeObj = this.getMergeObjectFromArgs(args);
            console.log(mergeObj);
            /*
              - npc.npcId=""
              - spawner.* (adjust properties for the spawner
        
              then create a new spawner, give it the npc id.
             */
            const defaultSpawner = {
                maxCreatures: 1,
                respawnRate: 0,
                initialSpawn: 1,
                spawnRadius: 0,
                randomWalkRadius: 10,
                leashRadius: 50,
                shouldStrip: false,
                stripOnSpawner: true
            };
            const defaultNpc = {
                npcId: ''
            };
            if (!mergeObj.npc || !mergeObj.npc.npcId)
                return player.sendClientMessage('You must specify npc.npcId!');
            const spawnerOpts = lodash_1.merge(defaultSpawner, mergeObj.spawner || {});
            const npcOpts = lodash_1.merge(defaultNpc, mergeObj.npc || {});
            const { npcId } = npcOpts;
            const npcData = yield npc_loader_1.NPCLoader.loadNPCData(npcId);
            if (!npcData)
                return player.sendClientMessage('That npcId is not valid!');
            spawnerOpts.npcIds = [npcId];
            const spawner = new Spawner_1.Spawner(room, player, spawnerOpts);
            room.addSpawner(spawner);
        });
    }
}
exports.GMSpawnNPC = GMSpawnNPC;
//# sourceMappingURL=GMSpawnNPC.js.map