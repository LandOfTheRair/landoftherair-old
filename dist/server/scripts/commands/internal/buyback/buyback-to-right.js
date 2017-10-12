"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
const item_1 = require("../../../../../models/item");
class BuybackToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~OtR';
        this.format = 'MerchantUUID ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const [containerUUID, slot] = args.split(' ');
        const container = room.state.findNPC(containerUUID);
        if (!container)
            return player.sendClientMessage('That person is not here.');
        const item = player.buyback[+slot];
        if (!item)
            return player.sendClientMessage('You do not see that item.');
        if (player.gold < item._buybackValue)
            return player.sendClientMessage('You do not have enough gold for that.');
        if (!player.hasEmptyHand())
            return player.sendClientMessage('Your hands are full.');
        player.buyItemBack(slot);
        player.loseGold(item._buybackValue);
        const newItem = new item_1.Item(item);
        if (player.rightHand && !player.leftHand) {
            player.setLeftHand(player.rightHand);
        }
        player.setRightHand(newItem);
    }
}
exports.BuybackToRight = BuybackToRight;
//# sourceMappingURL=buyback-to-right.js.map