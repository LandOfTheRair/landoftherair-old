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
const lodash_1 = require("lodash");
class GMForgeItem extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@itemforge';
        this.format = 'Props...';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            if (player.rightHand)
                return player.sendClientMessage('Empty your right hand first.');
            const mergeObj = this.getMergeObjectFromArgs(args);
            if (!mergeObj.name)
                return player.sendClientMessage('You need to specify a name.');
            if (!mergeObj.desc)
                return player.sendClientMessage('You need to specify a desc.');
            if (!mergeObj.sprite)
                return player.sendClientMessage('You need to specify a sprite.');
            if (!mergeObj.itemClass)
                return player.sendClientMessage('You need to specify an itemClass.');
            if (!lodash_1.includes(item_1.EquippableItemClassesWithWeapons, mergeObj.itemClass)) {
                player.sendClientMessage('WARN: This item is not a valid equippable item or a weapon.');
            }
            if (!lodash_1.includes(item_1.ValidItemTypes, mergeObj.type)) {
                player.sendClientMessage(`WARN: ${mergeObj.type || '(none)'} is not a valid type (for skills). Setting to Martial.`);
                mergeObj.type = 'Martial';
            }
            const item = new item_1.Item(mergeObj);
            player.setRightHand(item);
        });
    }
}
exports.GMForgeItem = GMForgeItem;
//# sourceMappingURL=GMForgeItem.js.map