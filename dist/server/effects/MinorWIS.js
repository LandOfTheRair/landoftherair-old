"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorWIS extends Effect_1.Effect {
    effectStart(char) {
        const canGainMP = char.baseClass === 'Healer' && char.getBaseStat('mp') < 200;
        if (char.getBaseStat('wis') >= Effect_1.Maxes.Minor && !canGainMP) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        if (canGainMP) {
            char.gainBaseStat('mp', 2);
        }
        char.gainBaseStat('wis', this.potency);
        char.recalculateStats();
        this.effectMessage(char, 'You feel like you can make better decisions!');
    }
}
exports.MinorWIS = MinorWIS;
//# sourceMappingURL=MinorWIS.js.map