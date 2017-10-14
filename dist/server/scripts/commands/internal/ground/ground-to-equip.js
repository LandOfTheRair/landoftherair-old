"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class GroundToEquip extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~GtE';
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
        if (!player.canEquip(item))
            return player.sendClientMessage('You cannot equip that item.');
        player.equip(item);
        room.removeItemFromGround(item);
    }
}
exports.GroundToEquip = GroundToEquip;
//# sourceMappingURL=ground-to-equip.js.map