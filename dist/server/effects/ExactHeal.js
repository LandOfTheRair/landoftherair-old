"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
class ExactHeal extends Effect_1.Effect {
    effectStart(char) {
        char.hp.add(this.potency);
        this.effectMessage(char, 'You have been healed.');
    }
}
exports.ExactHeal = ExactHeal;
//# sourceMappingURL=ExactHeal.js.map