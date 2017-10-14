"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class BeltToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtR';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.belt.takeItemFromSlot(slot);
        if (!item)
            return false;
        this.trySwapRightToLeft(player);
        player.setRightHand(item);
    }
}
exports.BeltToRight = BeltToRight;
//# sourceMappingURL=belt-to-right.js.map