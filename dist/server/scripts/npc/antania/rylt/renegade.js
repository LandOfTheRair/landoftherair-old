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
const RENEGADE_BOOK = 'Rylt Renegade Book';
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem(RENEGADE_BOOK);
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, RENEGADE_BOOK)) {
            npc_loader_1.NPCLoader.takePlayerItem(player, RENEGADE_BOOK);
            npc_loader_1.NPCLoader.loadItem('Antanian Health Potion')
                .then(item => {
                player.setRightHand(item);
            });
            return 'Well, thank you, kind adventurer. Here is your reward, as promised.';
        }
        return `Why, hello. It's not often that I get visitors down here in my hidey-hole. I like to read, they call me the read-agade. Get it? Anyway, if you can bring me some BOOKS to stave off the boredom of my already-vast collection, I'd be grateful. Those muscleheads above us have some novels I've not yet read. They're too dimwitted to understand the intricacies of the words on the page, so I'd appreciate them being given to someone who does. Me, that is. Be warned though, those barbarians rip apart books on the regular.`;
    });
    npc.parser.addCommand('books')
        .set('syntax', ['books'])
        .set('logic', (args, { player }) => {
        return `Books, books. Ah yes. Rewards, you want one, yes? If you bring me a book and hold it in your right hand, I'll give you a potion to permanently increase your health. It's very handy. Be warned that it does have limitations.`;
    });
};
//# sourceMappingURL=renegade.js.map