"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class EquipToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~EtR';
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
        if (player.rightHand && !player.leftHand) {
            player.setLeftHand(player.rightHand);
        }
        player.unequip(slot);
        player.setRightHand(item);
    }
}
exports.EquipToRight = EquipToRight;
//# sourceMappingURL=equip-to-right.js.map