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
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem('Gold Coin');
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Help! Help! Heeeeeelp! He-oh, hey, it's a person! My BROTHERS and I are trapped here, can you HELP?`;
    });
    npc.parser.addCommand('brothers')
        .set('syntax', ['brothers'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Yes. My eldest brother, TONWIN, imprisoned myself, TAKWIN, and TERWIN here. We were all tricked!`;
    });
    npc.parser.addCommand('help')
        .set('syntax', ['help'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Yes, you can get us out of here. I fear we're magically bound to this prison, though. I bet if you could win against TONWIN, we could be free!`;
    });
    npc.parser.addCommand('tonwin')
        .set('syntax', ['tonwin'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Yes, Tonwin tricked us all. He convinced us all to work against each other, bringing us deeper and deeper into the prison and imprisoning us separately from each other, all the while convincing us we would get something out of it. Money, fame, strength, you know how it goes. We were greedy.`;
    });
    npc.parser.addCommand('takwin')
        .set('syntax', ['takwin'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Takwin was the closest to TONWIN. He's probably very close to Tonwin; he always trusted Takwin's counsel. I bet he would give you the strength he desired if you could help him.`;
    });
    npc.parser.addCommand('terwin')
        .set('syntax', ['terwin'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Terwin always was a bit of an outcast to us. Who knows what was done with him, or if he's even alive? He probably can't give you the fame he so desired, but I'm sure he could help you in other ways.`;
    });
    npc.parser.addCommand('telwin')
        .set('syntax', ['telwin'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        return `Yes, yes. You see, I wanted money. With it, I could live comfortably in a Steffen castle. If you bring me PROOF of Tonwin's death, I can reward you with what I have.`;
    });
    npc.parser.addCommand('proof')
        .set('syntax', ['proof'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
            npc_loader_1.NPCLoader.takePlayerItem(player, TONWIN_SWORD);
            npc_loader_1.NPCLoader.loadItem('Gold Coin')
                .then(item => {
                item.value = 20000;
                player.setRightHand(item);
            });
            return `Thank you, ${player.name}. Here is your reward for my freedom!`;
        }
        return `I don't see any proof.`;
    });
};
//# sourceMappingURL=telwin.js.map