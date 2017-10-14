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
const lodash_1 = require("lodash");
class GMModifyItem extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '@itemmod';
        this.format = 'Props...';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!player.isGM)
                return;
            if (!player.rightHand)
                return player.sendClientMessage('Hold an item in your right hand to modify.');
            const mergeObj = this.getMergeObjectFromArgs(args);
            lodash_1.merge(player.rightHand, mergeObj);
        });
    }
}
exports.GMModifyItem = GMModifyItem;
//# sourceMappingURL=GMModifyItem.js.map