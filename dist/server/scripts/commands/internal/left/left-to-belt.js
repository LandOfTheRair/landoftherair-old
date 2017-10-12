"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class LeftToBelt extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtB';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const item = player.leftHand;
        if (!item)
            return false;
        if (!player.addItemToBelt(item))
            return;
        player.setLeftHand(null);
    }
}
exports.LeftToBelt = LeftToBelt;
//# sourceMappingURL=left-to-belt.js.map