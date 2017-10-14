"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class Say extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~say';
    }
    execute(player, { room, gameState, args }) {
        if (!args)
            return false;
        player.sendClientMessageToRadius({ name: player.name, message: args }, 6);
    }
}
exports.Say = Say;
//# sourceMappingURL=Say.js.map