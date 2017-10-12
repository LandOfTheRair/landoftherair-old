"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class PotionToMerchant extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~PtM';
        this.format = 'MerchantUUID';
    }
    execute(player, { room, gameState, args }) {
        const merchantUUID = args;
        if (!this.checkPlayerEmptyHand(player))
            return;
        const container = room.state.findNPC(merchantUUID);
        if (!container)
            return player.sendClientMessage('That person is not here.');
        if (container.distFrom(player) > 2)
            return player.sendClientMessage('That person is too far away.');
        const item = player.potionHand;
        if (!item)
            return false;
        if (!item.isOwnedBy(player))
            return player.sendClientMessage('That is not yours!');
        player.setPotionHand(null);
        player.sellItem(item);
    }
}
exports.PotionToMerchant = PotionToMerchant;
//# sourceMappingURL=potion-to-merchant.js.map