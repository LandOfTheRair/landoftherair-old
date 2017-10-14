"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const move_helper_1 = require("../../../helpers/move-helper");
class Move extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~move';
    }
    execute(player, { room, gameState, x, y }) {
        move_helper_1.MoveHelper.move(player, { room, gameState, x, y });
    }
}
exports.Move = Move;
//# sourceMappingURL=Move.js.map