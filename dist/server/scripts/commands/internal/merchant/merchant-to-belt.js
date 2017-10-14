"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
const item_1 = require("../../../../../models/item");
class MerchantToBelt extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~MtB';
        this.format = 'MerchantUUID ItemUUID Quantity';
    }
    execute(player, { room, gameState, args }) {
        const [containerUUID, itemUUID, quantityCheck] = args.split(' ');
        const quantity = Math.round(+quantityCheck);
        if (quantity < 0)
            return false;
        if (!this.checkPlayerEmptyHand(player))
            return;
        if (!this.checkMerchantDistance(player, containerUUID))
            return;
        const item = this.checkMerchantItems(player, containerUUID, itemUUID);
        if (!item)
            return;
        if (!item.isBeltable)
            return player.sendClientMessage('That item is not beltable, cheater.');
        const maxQuantity = Math.min(quantity, player.belt.size - player.belt.allItems.length);
        for (let i = 0; i < maxQuantity; i++) {
            if (player.gold < item.value)
                return player.sendClientMessage('You do not have enough gold for that.');
            player.loseGold(item.value);
            const newItem = new item_1.Item(item);
            newItem.regenerateUUID();
            player.addItemToBelt(newItem);
        }
    }
}
exports.MerchantToBelt = MerchantToBelt;
//# sourceMappingURL=merchant-to-belt.js.map