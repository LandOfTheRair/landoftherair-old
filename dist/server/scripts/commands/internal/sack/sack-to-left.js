"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class SackToLeft extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StL';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.sack.takeItemFromSlot(slot);
        if (!item)
            return false;
        this.trySwapLeftToRight(player);
        player.setLeftHand(item);
    }
}
exports.SackToLeft = SackToLeft;
//# sourceMappingURL=sack-to-left.js.map