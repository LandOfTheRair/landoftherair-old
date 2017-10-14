"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class PartyGive extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'party give';
    }
    execute(player, { room, gameState, args }) {
        if (!player.party)
            return player.sendClientMessage('You are not in a party!');
        if (!args)
            return player.sendClientMessage('You need to specify a person to give leadership to!');
        const party = player.party;
        if (!party.isLeader(player.username))
            return player.sendClientMessage('You aren\'t the party leader!');
        const possTargets = player.$$room.getPossibleMessageTargets(player, args);
        const target = possTargets[0];
        if (!target)
            return player.sendClientMessage('You do not see that person.');
        if (target.partyName !== player.partyName)
            return player.sendClientMessage(`${target.name} is not in your party!`);
        room.partyManager.changeLeader(player, target);
    }
}
exports.PartyGive = PartyGive;
//# sourceMappingURL=PartyGive.js.map