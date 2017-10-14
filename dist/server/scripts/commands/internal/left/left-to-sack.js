"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class LeftToSack extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtS';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const item = player.leftHand;
        if (!item)
            return false;
        if (!player.addItemToSack(item))
            return;
        player.setLeftHand(null);
    }
}
exports.LeftToSack = LeftToSack;
//# sourceMappingURL=left-to-sack.js.map