"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const command_executor_1 = require("../../../helpers/command-executor");
class N extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'n';
    }
    execute(player, { room, gameState }) {
        command_executor_1.CommandExecutor.executeCommand(player, '~move', { room, gameState, x: 0, y: -1 });
    }
}
exports.N = N;
//# sourceMappingURL=n.js.map