"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class GMTeleport extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@teleport';
        this.format = 'X Y [Map]';
    }
    execute(player, { room, gameState, args }) {
        if (!player.isGM)
            return;
        const [x, y, map] = args.split(' ');
        if (!x || !y || args.length < 2)
            return false;
        room.teleport(player, { x: +x, y: +y, newMap: map });
    }
}
exports.GMTeleport = GMTeleport;
//# sourceMappingURL=GMTeleport.js.map