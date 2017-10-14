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
class GMModifyNPC extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@npcmod';
        this.format = 'Target Props...';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            const [npcish, props] = args.split(' ', 2);
            const possTargets = room.getPossibleMessageTargets(player, npcish);
            if (!possTargets.length)
                return player.sendClientMessage('You do not see that person.');
            const target = possTargets[0];
            if (!target)
                return false;
            const fullProps = args.substring(args.indexOf(props));
            const mergeObj = this.getMergeObjectFromArgs(fullProps);
            lodash_1.merge(target, mergeObj);
        });
    }
}
exports.GMModifyNPC = GMModifyNPC;
//# sourceMappingURL=GMModifyNPC.js.map