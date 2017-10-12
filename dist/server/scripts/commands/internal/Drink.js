"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
class Drink extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~drink';
    }
    execute(player, { room, gameState, args }) {
        const item = player.potionHand;
        if (!item)
            return player.sendClientMessage('You do not have a potion to drink!');
        player.useItem('potionHand');
    }
}
Drink.macroMetadata = {
    name: 'Drink',
    macro: '~drink',
    icon: 'potion-ball',
    color: '#2020B2',
    mode: 'autoActivate'
};
exports.Drink = Drink;
//# sourceMappingURL=Drink.js.map