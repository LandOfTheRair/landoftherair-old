"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class DebugPos extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~~pos';
    }
    execute(player, { room, args }) {
        player.sendClientMessage(`Currently @ ${player.x}, ${player.y} on ${player.map}.`);
    }
}
exports.DebugPos = DebugPos;
//# sourceMappingURL=DebugPos.js.map