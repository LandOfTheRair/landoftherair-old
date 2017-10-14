"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class LeftToPotion extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtP';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const left = player.leftHand;
        if (!left)
            return false;
        if (left.itemClass !== 'Bottle')
            return player.sendClientMessage('That item is not a bottle.');
        if (player.potionHand)
            return player.sendClientMessage('Your potion slot is occupied.');
        player.setPotionHand(left);
        player.setLeftHand(null);
    }
}
exports.LeftToPotion = LeftToPotion;
//# sourceMappingURL=left-to-potion.js.map