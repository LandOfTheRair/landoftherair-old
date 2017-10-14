"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class LeftToEquip extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtE';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (lodash_1.isUndefined(slot))
            return false;
        const item = player.leftHand;
        if (!item)
            return false;
        if (!player.canEquip(item))
            return player.sendClientMessage('You cannot equip that item.');
        player.equip(item);
        player.setLeftHand(null);
    }
}
exports.LeftToEquip = LeftToEquip;
//# sourceMappingURL=left-to-equip.js.map