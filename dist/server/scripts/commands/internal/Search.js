"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Look_1 = require("./Look");
class Search extends Look_1.Look {
    constructor() {
        super(...arguments);
        this.name = '~search';
    }
    execute(player, { room, gameState, args }) {
        const items = gameState.getGroundItems(player.x, player.y);
        if (items.Corpse) {
            items.Corpse.forEach(corpse => {
                room.dropCorpseItems(corpse, player);
            });
        }
        super.execute(player, { room, gameState, args });
    }
}
Search.macroMetadata = {
    name: 'Search',
    macro: '~search',
    icon: 'cash',
    color: '#665600',
    mode: 'autoActivate'
};
exports.Search = Search;
//# sourceMappingURL=Search.js.map