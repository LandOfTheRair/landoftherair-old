"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class SackToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StR';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.sack.takeItemFromSlot(slot);
        if (!item)
            return false;
        this.trySwapRightToLeft(player);
        player.setRightHand(item);
    }
}
exports.SackToRight = SackToRight;
//# sourceMappingURL=sack-to-right.js.map