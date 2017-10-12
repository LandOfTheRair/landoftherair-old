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
const Command_1 = require("../../../../base/Command");
class LockerToPotion extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~WtP';
        this.format = 'ItemSlot LockerID';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [slotId, lockerId] = args.split(' ');
            if (!this.checkPlayerEmptyHand(player))
                return;
            if (!this.findLocker(player))
                return;
            const locker = yield room.loadLocker(player, lockerId);
            if (!locker)
                return false;
            const item = locker.getItemFromSlot(+slotId);
            if (!item)
                return;
            if (item.itemClass !== 'Bottle')
                return player.sendClientMessage('That item is not a bottle.');
            locker.takeItemFromSlot(+slotId);
            player.setPotionHand(item);
            room.updateLocker(player, locker);
        });
    }
}
exports.LockerToPotion = LockerToPotion;
//# sourceMappingURL=locker-to-potion.js.map