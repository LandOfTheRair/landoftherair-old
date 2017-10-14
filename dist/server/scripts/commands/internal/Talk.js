"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class Talk extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~talk';
    }
    execute(player, { room, gameState, args }) {
        const argArr = args.split(',');
        argArr[1] = argArr[1].trim();
        const [findStr, message] = argArr;
        const possTargets = room.getPossibleMessageTargets(player, findStr);
        const target = possTargets[0];
        if (!target)
            return player.sendClientMessage('You do not see that person.');
        target.receiveMessage(player, message);
    }
}
exports.Talk = Talk;
//# sourceMappingURL=Talk.js.map