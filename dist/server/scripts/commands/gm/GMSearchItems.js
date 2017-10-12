"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../base/Command");
const item_creator_1 = require("../../../helpers/item-creator");
class GMSearchItems extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@searchitems';
        this.format = 'ItemName';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            const itemName = args;
            if (!itemName)
                return false;
            let items;
            try {
                items = yield item_creator_1.ItemCreator.searchItems(itemName);
            }
            catch (e) {
                return;
            }
            if (!items.length)
                return player.sendClientMessage(`No items matching "${itemName}" were found.`);
            player.sendClientMessage(`Search results for item with name "${itemName}":`);
            for (let i = 0; i < items.length; i++) {
                if (i >= 5) {
                    player.sendClientMessage(`... and ${items.length - 5} more.`);
                    return;
                }
                player.sendClientMessage(`${i + 1}: ${items[i].name}`);
            }
        });
    }
}
exports.GMSearchItems = GMSearchItems;
//# sourceMappingURL=GMSearchItems.js.map