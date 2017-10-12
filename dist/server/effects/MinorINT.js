"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorINT extends Effect_1.Effect {
    effectStart(char) {
        const canGainMP = char.baseClass === 'Mage' && char.getBaseStat('mp') < 200;
        if (char.getBaseStat('int') >= Effect_1.Maxes.Minor && !canGainMP) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        if (canGainMP) {
            char.gainBaseStat('mp', 2);
        }
        char.gainBaseStat('int', this.potency);
        char.recalculateStats();
        this.effectMessage(char, 'Your head is swimming with knowledge!');
    }
}
exports.MinorINT = MinorINT;
//# sourceMappingURL=MinorINT.js.map