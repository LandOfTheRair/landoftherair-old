"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class EquipToBelt extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~EtB';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = args;
        if (lodash_1.isUndefined(slot))
            return false;
        const item = player.gear[slot];
        if (!item)
            return false;
        if (!player.addItemToBelt(item))
            return;
        player.unequip(slot);
    }
}
exports.EquipToBelt = EquipToBelt;
//# sourceMappingURL=equip-to-belt.js.map