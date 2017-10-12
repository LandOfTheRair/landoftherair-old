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
const quests_1 = require("../../../../quests");
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem('Antanian Halberd');
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        if (player.hasQuest(quests_1.KillRebels)) {
            if (quests_1.KillRebels.isComplete(player)) {
                quests_1.KillRebels.completeFor(player);
                return 'Thank you for taking care of that for me. Here\'s your reward, and if you need me, I\'ll be buried in paperwork...';
            }
            return quests_1.KillRebels.incompleteText(player);
        }
        return `Hello, ${player.name}! Don't mind me and this stack of paperwork, I've been having troubles with the PRISONERS lately.`;
    });
    npc.parser.addCommand('prisoners')
        .set('syntax', ['prisoners'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Why, yes. They've been doing nothing but trying to riot down there, as if they could actually get out. Regardless, I could use some HELP containing them.`;
    });
    npc.parser.addCommand('help')
        .set('syntax', ['help'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        player.startQuest(quests_1.KillRebels);
        return `Yes, please kill ${quests_1.KillRebels.killsRequired} prisoners for me. Actually kill them. There's no paperwork to deal with if they're no longer living, you see. Get it done, and get it done fast. I'll give you a reward of 2,000 gold if you do -- 100 gold per prisoner killed.`;
    });
};
//# sourceMappingURL=guard-jarek.js.map