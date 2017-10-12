"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class EquipToGround extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~EtG';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = args;
        if (lodash_1.isUndefined(slot))
            return false;
        const item = player.gear[slot];
        if (!item)
            return false;
        if (!player.hasEmptyHand())
            return player.sendClientMessage('Your hands are full.');
        room.addItemToGround(player, item);
        room.showGroundWindow(player);
        player.unequip(slot);
    }
}
exports.EquipToGround = EquipToGround;
//# sourceMappingURL=equip-to-ground.js.map