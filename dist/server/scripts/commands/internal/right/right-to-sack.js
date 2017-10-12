"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class RightToSack extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~RtS';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const item = player.rightHand;
        if (!item)
            return false;
        if (!player.addItemToSack(item))
            return;
        player.setRightHand(null);
    }
}
exports.RightToSack = RightToSack;
//# sourceMappingURL=right-to-sack.js.map