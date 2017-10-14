"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClass_1 = require("../base/BaseClass");
class Thief extends BaseClass_1.BaseClass {
    static becomeClass(character) {
        super.becomeClass(character);
    }
    static gainLevelStats(character) {
        super.gainLevelStats(character);
        character.gainBaseStat('hp', this.rollDie(`1df([con] / 3) + f([con] / 2)`, character));
    }
}
Thief.combatDamageMultiplier = 1.25;
Thief.combatLevelDivisor = 4;
Thief.willDivisor = 4;
exports.Thief = Thief;
//# sourceMappingURL=Thief.js.map