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
    npc.leftHand = yield npc_loader_1.NPCLoader.loadItem('Tutorial Yeti Skull');
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem('Tutorial Key');
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Tunic');
    npc.recalculateStats();
});
exports.responses = (npc) => {
    npc.parser.addCommand('hello')
        .set('syntax', ['hello'])
        .set('logic', (args, { player }) => {
        if (npc_loader_1.NPCLoader.checkPlayerHeldItem(player, 'Tutorial Yeti Skull')) {
            npc_loader_1.NPCLoader.takePlayerItem(player, 'Tutorial Yeti Skull');
            npc_loader_1.NPCLoader.givePlayerItem(player, 'Tutorial Key');
            return `Ah, thank you ${player.name}! I see you've brought me the skull of the feared yeti. Here, you can have this key. Now go out into the world and do great things!`;
        }
        return `Hello and welcome to The Land of the Rair, ${player.name}! It looks like you're stuck in here with me. But fret not, I can HELP you! [Hint: You can talk with NPCs by saying their name, comma, then what you want to ask about. For example, in command mode, say "her, help"]`;
    });
    npc.parser.addCommand('help')
        .set('syntax', ['help'])
        .set('logic', (args, { player }) => {
        return `Yes, I can help you, and you can help me. If you kill the nearby YETI and bring me his SKULL, I can give you a KEY to let you out of here.`;
    });
    npc.parser.addCommand('yeti')
        .set('syntax', ['yeti'])
        .set('logic', () => {
        return `Yes, yes. There is a yeti in the forest to the east. He plagues this small town, and no one would miss him if he were to, erm, expire. You may want to dedicate to a PROFESSION before taking him on, though.`;
    });
    npc.parser.addCommand('skull')
        .set('syntax', ['skull'])
        .set('logic', () => {
        return `Yeti skulls happen to be a prized item in these parts. No, I'm not some sort of weirdo! I'll trade you a KEY for his skull. Just hold it in your hand, and greet me again! Note also that the skull must BELONG to you!`;
    });
    npc.parser.addCommand('belong')
        .set('syntax', ['belong'])
        .set('logic', () => {
        return `Yes, yes. Some items have a faint warm sensation upon grasping them. It truly is a strange phenomena, but it means that you own that item, and no one else can use it. That's how I'll known you've completed your trial!`;
    });
    npc.parser.addCommand('key')
        .set('syntax', ['key'])
        .set('logic', () => {
        return `Yes, I'm willing to trade this key for the Yeti's skull. A small price for your freedom, wouldn't you say?`;
    });
    npc.parser.addCommand('profession')
        .set('syntax', ['profession'])
        .set('logic', () => {
        return `Rumor has it, there's an enclave of trainers that seek new recruits for their ranks. I don't know where to find them, but I can grant you VISION to help you on your way.`;
    });
    npc.parser.addCommand('vision')
        .set('syntax', ['vision'])
        .set('logic', (args, { player }) => {
        npc_loader_1.NPCLoader.givePlayerEffect(player, 'TrueSight', { duration: 100 });
        return `Here you go! Best of luck on finding them. I hear they're holed up in the northeast somewhere.`;
    });
};
//# sourceMappingURL=hermit.js.map