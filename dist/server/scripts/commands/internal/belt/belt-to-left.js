"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class BeltToLeft extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtL';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.belt.takeItemFromSlot(slot);
        if (!item)
            return false;
        this.trySwapLeftToRight(player);
        player.setLeftHand(item);
    }
}
exports.BeltToLeft = BeltToLeft;
//# sourceMappingURL=belt-to-left.js.map