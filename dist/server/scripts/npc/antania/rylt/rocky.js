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
const GOLEM_ROCK = 'Antanian Golem Brain';
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem(GOLEM_ROCK);
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        return `Hey! You! Help! I'm trapped in here. At least I think so. Name's Rocky, I'm a golem or somethin'. They made me smart and stuff but I seem to be stuck between a ROCK and a hard place. Ha ha.`;
    });
    npc.parser.addCommand('rock')
        .set('syntax', ['rock'])
        .set('logic', (args, { player }) => {
        return `Yeah! Yeah! Get it, 'cause I'm made of rocks and we're in a place made of- nevermind. Anyway, I can UPGRADE your gear to make it hard as a rock. Heh heh. You might have a lil' trouble finding 'em though, I don't think these guys are as smart as me.`;
    });
    npc.parser.addCommand('upgrade')
        .set('syntax', ['upgrade'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        const REQUIRED_ROCKS = 4;
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, GOLEM_ROCK, 'left')) {
            const right = player.rightHand;
            if (!right)
                return 'Please hold an item in your right hand.';
            right.stats.defense = right.stats.defense || 0;
            if (right.stats.defense !== 0)
                return 'That item already has defense adds!';
            let indexes = npc_loader_1.NPCLoader.getItemsFromPlayerSackByName(player, GOLEM_ROCK);
            indexes = indexes.slice(0, REQUIRED_ROCKS);
            if (indexes.length < REQUIRED_ROCKS)
                return 'You do not have enough golem brains for that!';
            npc_loader_1.NPCLoader.takePlayerItem(player, GOLEM_ROCK, 'left');
            npc_loader_1.NPCLoader.takeItemsFromPlayerSack(player, indexes);
            right.stats.defense += 1;
            player.recalculateStats();
            return `Thanks, ${player.name}! I've upgraded your item. And thanks for the rocks, heheh. I'm gonna be the smartest rock in this cave.`;
        }
        return `Hold one golem brain in your left hand, and I'll take that one plus four from your sack. Hold a piece of gear with no defensive adds in your right hand, and it will help you better in combat!`;
    });
};
//# sourceMappingURL=rocky.js.map