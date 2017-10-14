"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class RightToBelt extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~RtB';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const item = player.rightHand;
        if (!item)
            return false;
        if (!player.addItemToBelt(item))
            return;
        player.setRightHand(null);
    }
}
exports.RightToBelt = RightToBelt;
//# sourceMappingURL=right-to-belt.js.map