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
const item_1 = require("../../../../models/item");
class GMDuplicateItem extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@itemdupe';
        this.format = '';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            if (!player.rightHand)
                return player.sendClientMessage('Hold an item in your right hand to modify.');
            if (player.leftHand)
                return player.sendClientMessage('Empty your left hand.');
            const item = new item_1.Item(player.rightHand);
            item.regenerateUUID();
            player.setLeftHand(item);
        });
    }
}
exports.GMDuplicateItem = GMDuplicateItem;
//# sourceMappingURL=GMDuplicateItem.js.map