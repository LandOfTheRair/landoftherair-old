"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class LeftToGround extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtG';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        if (!player.leftHand)
            return;
        room.addItemToGround(player, player.leftHand);
        player.setLeftHand(null);
        room.showGroundWindow(player);
    }
}
exports.LeftToGround = LeftToGround;
//# sourceMappingURL=left-to-ground.js.map