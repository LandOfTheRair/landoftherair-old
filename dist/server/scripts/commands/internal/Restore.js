"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class Restore extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'restore';
    }
    execute(player, { room, gameState, args }) {
        if (!player.isDead())
            return;
        player.restore(false);
        player.sendClientMessage('You are being welcomed back to life.');
    }
}
Restore.macroMetadata = {
    name: 'Restore',
    macro: 'restore',
    icon: 'quicksand',
    color: '#8A6948',
    mode: 'autoActivate'
};
exports.Restore = Restore;
//# sourceMappingURL=Restore.js.map