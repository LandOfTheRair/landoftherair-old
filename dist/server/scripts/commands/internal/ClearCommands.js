"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class ClearCommands extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~clear';
    }
    execute(player, { room, gameState, args }) {
        player.$$actionQueue = [];
        player.sendClientMessage('Command buffer cleared.');
    }
}
ClearCommands.macroMetadata = {
    name: 'Clear Buffer',
    macro: '~clear',
    icon: 'ultrasound',
    color: '#000000',
    mode: 'autoActivate',
    key: 'ESCAPE'
};
exports.ClearCommands = ClearCommands;
//# sourceMappingURL=ClearCommands.js.map