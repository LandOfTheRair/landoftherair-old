"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class PartyCreate extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = 'party create';
    }
    execute(player, { room, gameState, args }) {
        if (player.party)
            return player.sendClientMessage('You are already in a party!');
        if (!args)
            return player.sendClientMessage('You need to specify a party name!');
        args = args.substring(0, 15);
        if (room.partyManager.getPartyByName(args))
            return player.sendClientMessage('That party already exists.');
        room.partyManager.createParty(player, args);
        player.sendClientMessage(`Created the "${args}" party!`);
    }
}
exports.PartyCreate = PartyCreate;
//# sourceMappingURL=PartyCreate.js.map