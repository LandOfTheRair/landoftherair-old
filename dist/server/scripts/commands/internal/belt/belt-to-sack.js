"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class BeltToSack extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtS';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.belt.getItemFromSlot(slot);
        if (!item)
            return false;
        const added = this.addItemToContainer(player, player.sack, item);
        if (!added)
            return;
        player.belt.takeItemFromSlot(slot);
    }
}
exports.BeltToSack = BeltToSack;
//# sourceMappingURL=belt-to-sack.js.map