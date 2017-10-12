"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class SackToMerchant extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~StM';
        this.format = 'Slot MerchantUUID';
    }
    execute(player, { room, gameState, args }) {
        const [slot, merchantUUID] = args.split(' ');
        if (!this.checkPlayerEmptyHand(player))
            return;
        const container = room.state.findNPC(merchantUUID);
        if (!container)
            return player.sendClientMessage('That person is not here.');
        if (container.distFrom(player) > 2)
            return player.sendClientMessage('That person is too far away.');
        const itemCheck = player.sack.getItemFromSlot(slot);
        if (!itemCheck.isOwnedBy(player))
            return player.sendClientMessage('That is not yours!');
        const item = player.sack.takeItemFromSlot(slot);
        if (!item)
            return false;
        player.sellItem(item);
    }
}
exports.SackToMerchant = SackToMerchant;
//# sourceMappingURL=sack-to-merchant.js.map