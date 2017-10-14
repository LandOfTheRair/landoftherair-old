"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class SackToEquip extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StE';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (lodash_1.isUndefined(slot))
            return false;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const item = player.sack.getItemFromSlot(slot);
        if (!item)
            return false;
        if (!player.canEquip(item))
            return player.sendClientMessage('You cannot equip that item.');
        player.equip(item);
        player.sack.takeItemFromSlot(slot);
    }
}
exports.SackToEquip = SackToEquip;
//# sourceMappingURL=sack-to-equip.js.map