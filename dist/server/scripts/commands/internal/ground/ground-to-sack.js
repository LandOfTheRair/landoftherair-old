"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class GroundToSack extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~GtS';
        this.format = 'ItemType ItemId';
    }
    execute(player, { room, gameState, args }) {
        const splitArgs = args.split(' ');
        if (splitArgs.length < 1)
            return false;
        const [itemType, itemId] = splitArgs;
        if (itemId) {
            const item = this.getItemFromGround(player, itemType, itemId);
            if (!item)
                return;
            if (!player.addItemToSack(item))
                return;
            room.removeItemFromGround(item);
        }
        else {
            const items = this.getItemsFromGround(player, itemType);
            if (!items)
                return;
            lodash_1.each(items, item => {
                if (!player.addItemToSack(item))
                    return false;
                room.removeItemFromGround(item);
            });
        }
    }
}
exports.GroundToSack = GroundToSack;
//# sourceMappingURL=ground-to-sack.js.map