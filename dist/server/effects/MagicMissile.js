"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
const dice = require("dice.js");
class MagicMissile extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Conjuration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        let mult = 0.25;
        if (this.potency > 0)
            mult = 0.5;
        if (this.potency > 11)
            mult = 2;
        if (this.potency > 21)
            mult = 4;
        const intCheck = Math.floor(mult * this.getCasterStat(caster, 'int'));
        const damage = +dice.roll(`${this.potency || 1}d${intCheck}`);
        this.magicalAttack(caster, target, {
            skillRef,
            atkMsg: `You fling magic missiles at ${target.name}!`,
            defMsg: `${caster.name} hit you with magic missiles!`,
            damage,
            damageClass: 'energy'
        });
    }
}
exports.MagicMissile = MagicMissile;
//# sourceMappingURL=MagicMissile.js.map