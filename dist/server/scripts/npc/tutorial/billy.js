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
const npc_loader_1 = require("../../../helpers/npc-loader");
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        return `Aw, shucks. Have you seen my pet Moose? It's so lonely in this town, I might have to move. There are just the MERCHANTS, the HERMIT, and me.`;
    });
    npc.parser.addCommand('merchants')
        .set('syntax', ['merchants'])
        .set('logic', (args, { player }) => {
        return `Yeah. The building to the south of here has some merchants. They sell armor, weapons, and potions. Nothin' there for a kid like me, though.`;
    });
    npc.parser.addCommand('hermit')
        .set('syntax', ['hermit'])
        .set('logic', (args, { player }) => {
        return `Old man Hermit is off in the distant house, northwest of here. I hear he has the key to let people out of this forsaken town, whatever that means.`;
    });
};
//# sourceMappingURL=billy.js.map