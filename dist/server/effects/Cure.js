"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
const dice = require("dice.js");
class Cure extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Restoration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        let mult = 0.5;
        if (this.potency > 0)
            mult = 1;
        if (this.potency > 11)
            mult = 4;
        if (this.potency > 21)
            mult = 8;
        const wisCheck = Math.floor(mult * this.getCasterStat(caster, 'wis'));
        const damage = -+dice.roll(`${this.potency || 1}d${wisCheck}`);
        this.magicalAttack(caster, target, {
            skillRef,
            atkMsg: `You heal ${target.name}.`,
            defMsg: `${target.name} healed you!`,
            damage,
            damageClass: 'heal'
        });
    }
}
exports.Cure = Cure;
//# sourceMappingURL=Cure.js.map