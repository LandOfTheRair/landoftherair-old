"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class DebugReset extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~~reset';
    }
    execute(player, { room, args }) {
        player.clearEffects();
        player.resetAdditionalStats();
    }
}
exports.DebugReset = DebugReset;
//# sourceMappingURL=DebugReset.js.map