"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class RightToPotion extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~RtP';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const right = player.rightHand;
        if (!right)
            return false;
        if (right.itemClass !== 'Bottle')
            return player.sendClientMessage('That item is not a bottle.');
        if (player.potionHand)
            return player.sendClientMessage('Your potion slot is occupied.');
        player.setPotionHand(right);
        player.setRightHand(null);
    }
}
exports.RightToPotion = RightToPotion;
//# sourceMappingURL=right-to-potion.js.map