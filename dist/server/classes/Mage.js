"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClass_1 = require("../base/BaseClass");
const character_1 = require("../../models/character");
class Mage extends BaseClass_1.BaseClass {
    static becomeClass(character) {
        super.becomeClass(character);
        if (!character.getBaseStat('mp')) {
            character.gainBaseStat('mp', 30);
            character._gainSkill(character_1.SkillClassNames.Conjuration, character.calcSkillXP(1));
        }
    }
    static gainLevelStats(character) {
        super.gainLevelStats(character);
        character.gainBaseStat('hp', this.rollDie(`1d[con]`, character));
        character.gainBaseStat('mp', this.rollDie(`2d[int] + f([int] / 5)`, character));
    }
}
Mage.combatDamageMultiplier = 0.85;
Mage.combatLevelDivisor = 5;
Mage.willDivisor = 3;
exports.Mage = Mage;
//# sourceMappingURL=Mage.js.map