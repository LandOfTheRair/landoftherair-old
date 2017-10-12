"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class RightToGround extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~RtG';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        if (!player.rightHand)
            return;
        room.addItemToGround(player, player.rightHand);
        player.setRightHand(null);
        room.showGroundWindow(player);
    }
}
exports.RightToGround = RightToGround;
//# sourceMappingURL=right-to-ground.js.map