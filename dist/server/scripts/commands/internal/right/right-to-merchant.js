"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class RightToMerchant extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~RtM';
        this.format = 'MerchantUUID';
    }
    execute(player, { room, gameState, args }) {
        const item = player.rightHand;
        if (!item)
            return false;
        if (!item.isOwnedBy(player))
            return player.sendClientMessage('That is not yours!');
        if (!this.checkMerchantDistance(player, args))
            return;
        player.sellItem(item);
        player.setRightHand(null);
    }
}
exports.RightToMerchant = RightToMerchant;
//# sourceMappingURL=right-to-merchant.js.map