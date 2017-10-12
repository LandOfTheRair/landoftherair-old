"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorCHA extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('cha') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('cha', this.potency);
        this.effectMessage(char, 'You feel better-looking!');
    }
}
exports.MinorCHA = MinorCHA;
//# sourceMappingURL=MinorCHA.js.map