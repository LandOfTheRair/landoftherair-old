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
const common_responses_1 = require("../../common-responses");
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    common_responses_1.CrierResponses(npc);
    common_responses_1.RandomlyShouts(npc, [
        'Wolves are the natural predator of deer!',
        'You should not go far without armor or weapons!',
        'Potions can be a saving grace!',
        'The Alchemist can make your potions last longer!',
        'The Renegade camp in the southeast is full of dangerous brigands!',
        'The cave to the east is filled with practitioners of magic and their golems!',
        'Thieves prefer to hide!',
        'The Banker can hold onto your gold!',
        'The Smith can repair your broken and breaking gear!',
        'Beware the werecreatures!',
        'Werebear claws are prized by martial artists!',
        'The skin of deer is great at repelling magic!',
        'The Last Chance Prison is filled with rebellious infidels!',
        'There are tales of a renegade who collects books!',
        'Try asking the Healer to RECALL you!'
    ]);
};
//# sourceMappingURL=crier.js.map