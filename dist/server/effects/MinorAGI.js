"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorAGI extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('agi') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('agi', this.potency);
        char.recalculateStats();
        this.effectMessage(char, 'You feel like you could run faster!');
    }
}
exports.MinorAGI = MinorAGI;
//# sourceMappingURL=MinorAGI.js.map