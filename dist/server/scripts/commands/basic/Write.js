"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class Write extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'write';
        this.format = 'Message';
    }
    execute(player, { room, args }) {
        if (!args)
            return false;
        const right = player.rightHand;
        const left = player.leftHand;
        if (!right || right.desc !== 'an empty scroll')
            return player.sendClientMessage('You need an empty scroll in your right hand!');
        if (!left || left.name !== 'Ink Vial')
            return player.sendClientMessage('You need an ink pot in your left hand!');
        right.desc = `a scroll inscribed with text written in ink: "${args}"`;
        player.useItem('leftHand');
        player.sendClientMessage('You have scribed your message successfully.');
    }
}
exports.Write = Write;
//# sourceMappingURL=Write.js.map