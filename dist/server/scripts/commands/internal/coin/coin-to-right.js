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
class CoinToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~CtR';
        this.format = 'Value';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = +args;
            if (value <= 0 || value > player.gold || isNaN(value))
                return false;
            if (!player.hasEmptyHand())
                return player.sendClientMessage('Your hands are full.');
            if (player.rightHand && !player.leftHand) {
                player.setLeftHand(player.rightHand);
            }
            const item = yield item_creator_1.ItemCreator.getGold(value);
            player.setRightHand(item);
            player.loseGold(value);
        });
    }
}
exports.CoinToRight = CoinToRight;
//# sourceMappingURL=coin-to-right.js.map