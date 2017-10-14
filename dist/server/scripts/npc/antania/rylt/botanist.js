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
const npc_loader_1 = require("../../../../helpers/npc-loader");
const FLOWER = 'Rylt Blueflower';
const QUESTNAME = 'Rylt Botanist Regeneration';
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.leftHand = yield npc_loader_1.NPCLoader.loadItem(FLOWER);
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem(FLOWER);
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        if (player.hasPermanentCompletionFor(QUESTNAME))
            return `You've already brought me flowers, ${player.name}!`;
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, FLOWER, 'right')
            && npc_loader_1.NPCLoader.checkPlayerHeldItem(player, FLOWER, 'left')) {
            npc_loader_1.NPCLoader.takePlayerItem(player, FLOWER, 'right');
            npc_loader_1.NPCLoader.takePlayerItem(player, FLOWER, 'left');
            player.gainStat('hpregen', 1);
            player.gainStat('mpregen', 1);
            player.permanentlyCompleteQuest(QUESTNAME);
            return `Ah, thank you ${player.name}! Here, enjoy your increased regeneration.`;
        }
        return `Well hello there, adventurer! I am a roaming botanist and I seek the flowers of this land. If you can bring me two, I can increase your natural regeneration using a technique I learned from my master!`;
    });
};
//# sourceMappingURL=botanist.js.map