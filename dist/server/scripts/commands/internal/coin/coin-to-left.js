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
const Command_1 = require("../../../../base/Command");
const item_creator_1 = require("../../../../helpers/item-creator");
class CoinToLeft extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~CtL';
        this.format = 'Value';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = +args;
            if (value <= 0 || value > player.gold || isNaN(value))
                return false;
            if (!player.hasEmptyHand())
                return player.sendClientMessage('Your hands are full.');
            if (player.leftHand && !player.rightHand) {
                player.setRightHand(player.leftHand);
            }
            const item = yield item_creator_1.ItemCreator.getGold(value);
            player.setLeftHand(item);
            player.loseGold(value);
        });
    }
}
exports.CoinToLeft = CoinToLeft;
//# sourceMappingURL=coin-to-left.js.map