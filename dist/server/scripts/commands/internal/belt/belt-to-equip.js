"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class BeltToEquip extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtE';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.belt.getItemFromSlot(slot);
        if (!item)
            return false;
        if (!player.canEquip(item))
            return player.sendClientMessage('You cannot equip that item.');
        player.equip(item);
        player.belt.takeItemFromSlot(slot);
    }
}
exports.BeltToEquip = BeltToEquip;
//# sourceMappingURL=belt-to-equip.js.map