"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class GroundToPotion extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~GtP';
        this.format = 'ItemType ItemId';
    }
    execute(player, { room, gameState, args }) {
        const splitArgs = args.split(' ');
        if (splitArgs.length < 1)
            return false;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const [itemType, itemId] = splitArgs;
        let item = null;
        if (itemId) {
            item = this.getItemFromGround(player, itemType, itemId);
        }
        if (!item) {
            const items = this.getItemsFromGround(player, itemType);
            if (!items)
                return;
            item = items[0];
        }
        if (!item)
            return;
        if (item.itemClass !== 'Bottle')
            return player.sendClientMessage('That item is not a bottle.');
        if (player.potionHand)
            return player.sendClientMessage('Your potion slot is occupied.');
        player.setPotionHand(item);
        room.removeItemFromGround(item);
    }
}
exports.GroundToPotion = GroundToPotion;
//# sourceMappingURL=ground-to-potion.js.map