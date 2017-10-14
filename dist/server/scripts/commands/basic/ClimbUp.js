"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const lodash_1 = require("lodash");
class ClimbUp extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = ['climb up', 'climb down'];
    }
    execute(player, { room, gameState, args }) {
        const interactable = player.$$room.state.getInteractable(player.x, player.y);
        const stairs = interactable && lodash_1.includes(['ClimbUp', 'ClimbDown'], interactable.type) ? interactable : null;
        if (!stairs)
            return player.sendClientMessage('There are no grips here.');
        const { teleportMap, teleportX, teleportY } = stairs.properties;
        room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });
    }
}
ClimbUp.macroMetadata = {
    name: 'Climb',
    macro: 'climb up',
    icon: 'ladder',
    color: '#D2691E',
    mode: 'autoActivate'
};
exports.ClimbUp = ClimbUp;
//# sourceMappingURL=ClimbUp.js.map