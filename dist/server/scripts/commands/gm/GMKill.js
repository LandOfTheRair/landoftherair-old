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
class GMKill extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@kill';
        this.format = 'Target';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            const possTargets = room.getPossibleMessageTargets(player, args);
            if (!possTargets.length)
                return player.sendClientMessage('You do not see that person.');
            const target = possTargets[0];
            if (!target)
                return false;
            if (target.hostility === 'Never')
                return player.sendClientMessage('That target is not killable.');
            target.hp.toMinimum();
            target.die(player);
        });
    }
}
exports.GMKill = GMKill;
//# sourceMappingURL=GMKill.js.map