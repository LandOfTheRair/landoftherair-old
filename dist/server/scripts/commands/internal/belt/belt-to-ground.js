"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class BeltToGround extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtG';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.belt.takeItemFromSlot(slot);
        if (!item)
            return;
        room.addItemToGround(player, item);
        room.showGroundWindow(player);
    }
}
exports.BeltToGround = BeltToGround;
//# sourceMappingURL=belt-to-ground.js.map