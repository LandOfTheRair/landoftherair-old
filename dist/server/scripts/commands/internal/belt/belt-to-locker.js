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
class BeltToLocker extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~BtW';
        this.format = 'Slot LockerID';
    }
    execute(player, { room, gameState, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            const [slot, lockerId] = args.split(' ');
            if (!this.checkPlayerEmptyHand(player))
                return;
            if (!this.findLocker(player))
                return;
            const locker = yield room.loadLocker(player, lockerId);
            if (!locker)
                return;
            const item = player.belt.getItemFromSlot(slot);
            if (!this.addItemToContainer(player, locker, item))
                return;
            player.belt.takeItemFromSlot(slot);
            room.updateLocker(player, locker);
        });
    }
}
exports.BeltToLocker = BeltToLocker;
//# sourceMappingURL=belt-to-locker.js.map