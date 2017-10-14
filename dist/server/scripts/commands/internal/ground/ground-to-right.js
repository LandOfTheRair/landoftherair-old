"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class GroundToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~GtR';
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
        this.trySwapRightToLeft(player);
        player.setRightHand(item);
        room.removeItemFromGround(item);
    }
}
exports.GroundToRight = GroundToRight;
//# sourceMappingURL=ground-to-right.js.map