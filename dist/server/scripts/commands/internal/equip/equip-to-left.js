"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Command_1 = require("../../../../base/Command");
class EquipToLeft extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~EtL';
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
        if (player.leftHand && !player.rightHand) {
            player.setRightHand(player.leftHand);
        }
        player.unequip(slot);
        player.setLeftHand(item);
    }
}
exports.EquipToLeft = EquipToLeft;
//# sourceMappingURL=equip-to-left.js.map