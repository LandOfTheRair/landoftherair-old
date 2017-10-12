"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class SackToBelt extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StB';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.sack.getItemFromSlot(slot);
        if (!item)
            return false;
        const added = this.addItemToContainer(player, player.belt, item);
        if (!added)
            return;
        player.sack.takeItemFromSlot(slot);
    }
}
exports.SackToBelt = SackToBelt;
//# sourceMappingURL=sack-to-belt.js.map