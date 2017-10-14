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
class GMSummon extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@summon';
        this.format = 'PlayerName';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            const playerName = args;
            if (!playerName)
                return false;
            room.state.players.forEach(checkTarget => {
                if (!room.doesTargetMatchSearch(checkTarget, args))
                    return;
                checkTarget.x = player.x;
                checkTarget.y = player.y;
                room.state.calculateFOV(checkTarget);
            });
        });
    }
}
exports.GMSummon = GMSummon;
//# sourceMappingURL=GMSummon.js.map