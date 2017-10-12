"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class LeftToMerchant extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtM';
        this.format = 'MerchantUUID';
    }
    execute(player, { room, gameState, args }) {
        const item = player.leftHand;
        if (!item)
            return false;
        if (!item.isOwnedBy(player))
            return player.sendClientMessage('That is not yours!');
        if (!this.checkMerchantDistance(player, args))
            return;
        player.sellItem(item);
        player.setLeftHand(null);
    }
}
exports.LeftToMerchant = LeftToMerchant;
//# sourceMappingURL=left-to-merchant.js.map