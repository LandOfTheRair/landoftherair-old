"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const lodash_1 = require("lodash");
class UpStairs extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = ['up', 'down'];
    }
    execute(player, { room, gameState, args }) {
        const interactable = player.$$room.state.getInteractable(player.x, player.y, true);
        const stairs = interactable && lodash_1.includes(['StairsUp', 'StairsDown'], interactable.type) ? interactable : null;
        if (!stairs)
            return player.sendClientMessage('There are no stairs here.');
        const { teleportMap, teleportX, teleportY } = stairs.properties;
        room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });
    }
}
UpStairs.macroMetadata = {
    name: 'Stairs',
    macro: 'up',
    icon: '3d-stairs',
    color: '#404040',
    mode: 'autoActivate'
};
exports.UpStairs = UpStairs;
//# sourceMappingURL=UpStairs.js.map