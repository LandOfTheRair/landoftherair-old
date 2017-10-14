"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorWIL extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('wil') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('wil', this.potency);
        this.effectMessage(char, 'Your aura grows stronger!');
    }
}
exports.MinorWIL = MinorWIL;
//# sourceMappingURL=MinorWIL.js.map