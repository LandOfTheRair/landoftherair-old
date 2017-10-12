"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
const item_1 = require("../../../../../models/item");
class MerchantToPotion extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~MtP';
        this.format = 'MerchantUUID ItemUUID';
    }
    execute(player, { room, gameState, args }) {
        const [containerUUID, itemUUID] = args.split(' ');
        if (!this.checkPlayerEmptyHand(player))
            return;
        if (!this.checkMerchantDistance(player, containerUUID))
            return false;
        const item = this.checkMerchantItems(player, containerUUID, itemUUID);
        if (!item)
            return;
        if (item.itemClass !== 'Bottle')
            return player.sendClientMessage('That item is not a bottle.');
        if (player.gold < item.value)
            return player.sendClientMessage('You do not have enough gold for that.');
        player.loseGold(item.value);
        const newItem = new item_1.Item(item);
        newItem.regenerateUUID();
        player.setPotionHand(newItem);
    }
}
exports.MerchantToPotion = MerchantToPotion;
//# sourceMappingURL=merchant-to-potion.js.map