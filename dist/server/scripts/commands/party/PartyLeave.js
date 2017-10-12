"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class PartyLeave extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'party leave';
    }
    execute(player, { room, gameState }) {
        if (!player.party)
            return player.sendClientMessage('You are not in a party!');
        const partyName = player.partyName;
        room.partyManager.leaveParty(player);
        player.sendClientMessage(`You left the "${partyName}" party!`);
    }
}
exports.PartyLeave = PartyLeave;
//# sourceMappingURL=PartyLeave.js.map