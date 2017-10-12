"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class SackToGround extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StG';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.sack.takeItemFromSlot(slot);
        if (!item)
            return;
        room.addItemToGround(player, item);
        room.showGroundWindow(player);
    }
}
exports.SackToGround = SackToGround;
//# sourceMappingURL=sack-to-ground.js.map