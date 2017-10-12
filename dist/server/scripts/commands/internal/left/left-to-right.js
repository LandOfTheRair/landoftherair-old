"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
class LeftToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~LtR';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        const left = player.leftHand;
        const right = player.rightHand;
        player.setLeftHand(right, false);
        player.setRightHand(left, false);
    }
}
exports.LeftToRight = LeftToRight;
//# sourceMappingURL=left-to-right.js.map