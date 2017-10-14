"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorMP extends Effect_1.Effect {
    effectStart(char) {
        const baseMp = char.getBaseStat('mp');
        if (baseMp >= 300 || baseMp === 0) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('mp', this.potency);
        this.effectMessage(char, 'Your mental capacity has increased!');
    }
}
exports.MinorMP = MinorMP;
//# sourceMappingURL=MinorMP.js.map