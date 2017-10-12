"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class SackToPotion extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StP';
        this.format = 'ItemSlot';
    }
    execute(player, { room, gameState, args }) {
        const slot = +args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        if (player.potionHand)
            return player.sendClientMessage('Your potion slot is occupied.');
        const item = player.sack.getItemFromSlot(slot);
        if (!item)
            return false;
        if (item.itemClass !== 'Bottle')
            return player.sendClientMessage('That item is not a bottle.');
        player.setPotionHand(item);
        player.sack.takeItemFromSlot(slot);
    }
}
exports.SackToPotion = SackToPotion;
//# sourceMappingURL=sack-to-potion.js.map