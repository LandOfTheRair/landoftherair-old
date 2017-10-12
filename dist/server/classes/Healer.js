"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseClass_1 = require("../base/BaseClass");
const character_1 = require("../../models/character");
class Healer extends BaseClass_1.BaseClass {
    static becomeClass(character) {
        super.becomeClass(character);
        if (!character.getBaseStat('mp')) {
            character.gainBaseStat('mp', 30);
            character._gainSkill(character_1.SkillClassNames.Restoration, character.calcSkillXP(1));
        }
    }
    static gainLevelStats(character) {
        super.gainLevelStats(character);
        character.gainBaseStat('hp', this.rollDie(`f([con] / 5)d3 + f([con] / 3)`, character));
        character.gainBaseStat('mp', this.rollDie(`1d[wis] + f([wis] / 3)`, character));
    }
}
Healer.combatDamageMultiplier = 1;
Healer.combatLevelDivisor = 5;
Healer.willDivisor = 3;
exports.Healer = Healer;
//# sourceMappingURL=Healer.js.map