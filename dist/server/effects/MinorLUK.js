"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorLUK extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('luk') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('luk', this.potency);
        this.effectMessage(char, 'Your drink had a four-leaf clover in it!');
    }
}
exports.MinorLUK = MinorLUK;
//# sourceMappingURL=MinorLUK.js.map