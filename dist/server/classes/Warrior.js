"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClass_1 = require("../base/BaseClass");
class Warrior extends BaseClass_1.BaseClass {
    static becomeClass(character) {
        super.becomeClass(character);
    }
    static gainLevelStats(character) {
        super.gainLevelStats(character);
        character.gainBaseStat('hp', this.rollDie(`2df([con] / 3) + f([con] / 3)`, character));
    }
}
Warrior.combatDamageMultiplier = 1.5;
Warrior.combatLevelDivisor = 3;
Warrior.willDivisor = 4;
exports.Warrior = Warrior;
//# sourceMappingURL=Warrior.js.map