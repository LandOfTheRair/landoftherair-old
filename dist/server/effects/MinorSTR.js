"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorSTR extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('str') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('str', this.potency);
        this.effectMessage(char, 'Your muscles are bulging!');
    }
}
exports.MinorSTR = MinorSTR;
//# sourceMappingURL=MinorSTR.js.map