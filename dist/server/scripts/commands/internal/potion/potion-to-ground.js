"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class PotionToGround extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~PtG';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        if (!player.potionHand)
            return false;
        if (!player.hasEmptyHand())
            return player.sendClientMessage('Your hands are full.');
        room.addItemToGround(player, player.potionHand);
        player.setPotionHand(null);
        room.showGroundWindow(player);
    }
}
exports.PotionToGround = PotionToGround;
//# sourceMappingURL=potion-to-ground.js.map