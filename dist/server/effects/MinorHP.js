"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class MinorHP extends Effect_1.Effect {
    effectStart(char) {
        if (char.getBaseStat('hp') >= 200) {
            return this.effectMessage(char, 'The fluid was tasteless.');
        }
        char.gainBaseStat('hp', this.potency);
        this.effectMessage(char, 'You feel like you could take on the world!');
    }
}
exports.MinorHP = MinorHP;
//# sourceMappingURL=MinorHP.js.map