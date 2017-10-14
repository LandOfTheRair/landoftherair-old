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
const TONWIN_SWORD = 'Tonwin Sword';
const TAKWIN_GIFT = 'Takwin Shield';
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem(TAKWIN_GIFT);
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `I'm Takwin, but if you're here, you probably already knew that. Telwin is the only one who knows the way here -- he did DESIGN these prisons, after all.`;
    });
    npc.parser.addCommand('design')
        .set('syntax', ['design'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Telwin is a master architect. I've seen his tribute, his altar, and I've seen what lies beneath here. Whatever it is, it must have POSSESSED Tonwin -- I don't think he could have betrayed us by himself.`;
    });
    npc.parser.addCommand('possessed')
        .set('syntax', ['possessed'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Possessed is the word I would use. Some spirit or ghost or whatever they're called came out of the Altar. It gave Tonwin a murderous look in his eye -- I've never seen anything like it. I'm afraid he must be STOPPED.`;
    });
    npc.parser.addCommand('stopped')
        .set('syntax', ['stopped'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `The only way to stop him is to kill him. I wish there were another way. If you can bring me PROOF of his death, I can impart our family memento unto you.`;
    });
    npc.parser.addCommand('proof')
        .set('syntax', ['proof'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
            npc_loader_1.NPCLoader.takePlayerItem(player, TONWIN_SWORD);
            npc_loader_1.NPCLoader.loadItem(TAKWIN_GIFT)
                .then(item => {
                player.setRightHand(item);
            });
            return `Thank you, ${player.name}. Here is our family heirloom! May it protect you more than it did us!`;
        }
        return `I don't see any proof.`;
    });
};
//# sourceMappingURL=takwin.js.map