"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorCON extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('con') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        if (!this.ignoreHPBoost && char.getBaseStat('hp') < 100) {
            char.gainBaseStat('hp', 3);
        }
        char.gainBaseStat('con', this.potency);
        this.effectMessage(char, 'Your stomach feels stronger!');
    }
}
exports.MinorCON = MinorCON;
//# sourceMappingURL=MinorCON.js.map