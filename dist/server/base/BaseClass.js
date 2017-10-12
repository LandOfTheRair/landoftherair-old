"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dice = require("dice.js");
class BaseClass {
    static becomeClass(character) {
    }
    static rollDie(roll, character) {
        return +dice.roll(roll, character.baseStats);
    }
    static gainLevelStats(character) {
    }
}
exports.BaseClass = BaseClass;
//# sourceMappingURL=BaseClass.js.map