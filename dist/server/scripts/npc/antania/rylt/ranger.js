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
const BEAR_MEAT = 'Antanian Bear Meat';
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem(BEAR_MEAT);
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Breastplate');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        return `Greetings, adventurer. I am the ranger who collects bear meat. You see, I really like bear meat. It was my destiny to collect it. If you can bring me some bear meat, we can help each other. You can SELL it to me, I can UPGRADE your gear, or I can give you an ANTIDOTE to help you with the local wildlife.`;
    });
    npc.parser.addCommand('sell')
        .set('syntax', ['sell'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, BEAR_MEAT, 'left')) {
            let total = 150;
            npc_loader_1.NPCLoader.takePlayerItem(player, BEAR_MEAT, 'left');
            const indexes = npc_loader_1.NPCLoader.getItemsFromPlayerSackByName(player, BEAR_MEAT);
            total += indexes.length * 150;
            npc_loader_1.NPCLoader.takeItemsFromPlayerSack(player, indexes);
            player.gainGold(total);
            return `Thanks, ${player.name}! Here is ${total.toLocaleString()} gold for your efforts.`;
        }
        return `Hold one meat in your left hand, and I'll take that one as well as every one you're carrying. You can have 150 gold for each meat! Be sure you want to do this!`;
    });
    npc.parser.addCommand('upgrade')
        .set('syntax', ['upgrade'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        const REQUIRED_MEATS = 4;
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, BEAR_MEAT, 'left')) {
            const right = player.rightHand;
            if (!right)
                return 'Please hold an item in your right hand.';
            right.stats.offense = right.stats.offense || 0;
            if (right.stats.offense !== 0)
                return 'That item already has offensive adds!';
            let indexes = npc_loader_1.NPCLoader.getItemsFromPlayerSackByName(player, BEAR_MEAT);
            indexes = indexes.slice(0, REQUIRED_MEATS);
            if (indexes.length < REQUIRED_MEATS)
                return 'You do not have enough bear meat for that!';
            npc_loader_1.NPCLoader.takePlayerItem(player, BEAR_MEAT, 'left');
            npc_loader_1.NPCLoader.takeItemsFromPlayerSack(player, indexes);
            right.stats.offense += 1;
            player.recalculateStats();
            return `Thanks, ${player.name}! I've upgraded your item. And thanks for the meat, heheh.`;
        }
        return `Hold one meat in your left hand, and I'll take that one plus four from your sack. Hold a piece of gear with no offensive adds in your right hand, and it will help you better in combat!`;
    });
    npc.parser.addCommand('antidote')
        .set('syntax', ['antidote'])
        .set('logic', (args, { player }) => {
        if (npc.distFrom(player) > 2)
            return 'Please move closer.';
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, BEAR_MEAT, 'left')) {
            const right = player.rightHand;
            if (!right || right.name !== 'Mend Bottle')
                return 'Please hold a small healing bottle in your right hand.';
            const REQUIRED_MEATS = right.ounces;
            if (right.ounces > 1) {
                let indexes = npc_loader_1.NPCLoader.getItemsFromPlayerSackByName(player, BEAR_MEAT);
                indexes = indexes.slice(0, REQUIRED_MEATS);
                if (indexes.length < REQUIRED_MEATS)
                    return 'You do not have enough bear meat for that!';
                npc_loader_1.NPCLoader.takeItemsFromPlayerSack(player, indexes);
            }
            npc_loader_1.NPCLoader.takePlayerItem(player, BEAR_MEAT, 'left');
            npc_loader_1.NPCLoader.takePlayerItem(player, 'Mend Bottle', 'right');
            npc_loader_1.NPCLoader.loadItem('Bear Meat Antidote')
                .then(item => {
                item.ounces = REQUIRED_MEATS;
                player.setRightHand(item);
            });
            return `Thanks, ${player.name}! There's a bottle of antidote for ya. And thanks for the meat, heheh.`;
        }
        return `Hold one meat in your left hand, and hold a small healing bottle from town in your right. I'll take as many bear meat as there are ounces in the bottle and give you an antidote made with bear meat!`;
    });
};
//# sourceMappingURL=ranger.js.map