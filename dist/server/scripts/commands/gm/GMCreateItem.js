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
class GMCreateItem extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@item';
        this.format = 'ItemName';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            const itemName = args;
            if (!itemName)
                return false;
            let item;
            try {
                item = yield item_creator_1.ItemCreator.getItemByName(itemName);
            }
            catch (e) {
                player.sendClientMessage(`Warning: item "${itemName}" does not exist.`);
                return;
            }
            room.addItemToGround(player, item);
        });
    }
}
exports.GMCreateItem = GMCreateItem;
//# sourceMappingURL=GMCreateItem.js.map