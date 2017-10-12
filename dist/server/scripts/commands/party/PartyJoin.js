"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class PartyJoin extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'party join';
    }
    execute(player, { room, gameState, args }) {
        if (player.party)
            return player.sendClientMessage(`You are already in the "${player.partyName}" party!`);
        if (!args)
            return player.sendClientMessage('You need to specify a party name!');
        const party = room.partyManager.getPartyByName(args);
        if (!party)
            return player.sendClientMessage('That party doesn\'t exist.');
        let foundLeader = false;
        room.state.getPlayersInRange(player, 4).forEach(otherPlayer => {
            if (otherPlayer.username === party.leader.username)
                foundLeader = true;
        });
        if (!foundLeader)
            return player.sendClientMessage('You don\'t see the leader of that party.');
        room.partyManager.joinParty(player, args);
    }
}
exports.PartyJoin = PartyJoin;
//# sourceMappingURL=PartyJoin.js.map