"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class BeltToMerchant extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtM';
        this.format = 'Slot MerchantUUID';
    }
    execute(player, { room, gameState, args }) {
        const [slot, merchantUUID] = args.split(' ');
        if (!this.checkPlayerEmptyHand(player))
            return;
        if (!this.checkMerchantDistance(player, merchantUUID))
            return;
        const itemCheck = player.belt.getItemFromSlot(slot);
        if (!itemCheck.isOwnedBy(player))
            return player.sendClientMessage('That is not yours!');
        const item = player.belt.takeItemFromSlot(slot);
        if (!item)
            return false;
        player.sellItem(item);
    }
}
exports.BeltToMerchant = BeltToMerchant;
//# sourceMappingURL=belt-to-merchant.js.map