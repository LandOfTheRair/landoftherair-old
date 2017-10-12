"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorDEX extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('dex') >= Effect_1.Maxes.Minor) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('dex', this.potency);
        this.effectMessage(char, 'Your eyes feel sharper!');
    }
}
exports.MinorDEX = MinorDEX;
//# sourceMappingURL=MinorDEX.js.map