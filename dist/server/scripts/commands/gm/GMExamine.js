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
const Command_1 = require("../../../base/Command");
const lodash_1 = require("lodash");
class GMExamine extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@examine';
        this.format = 'Target? Prop?';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            if (!args && player.rightHand) {
                player.sendClientMessage(JSON.stringify(player.rightHand.toJSON()));
                return;
            }
            const [npcish, prop] = args.split(' ');
            const possTargets = room.getPossibleMessageTargets(player, npcish);
            if (!possTargets.length)
                return player.sendClientMessage('You do not see that person.');
            const target = possTargets[0];
            if (!target)
                return false;
            let targetJSON = target.toJSON();
            if (prop) {
                targetJSON = lodash_1.get(targetJSON, prop);
            }
            player.sendClientMessage(JSON.stringify(targetJSON));
        });
    }
}
exports.GMExamine = GMExamine;
//# sourceMappingURL=GMExamine.js.map