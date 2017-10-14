"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
const dice = require("dice.js");
class Afflict extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.maxSkillForSkillGain = 7;
        this.skillFlag = () => character_1.SkillClassNames.Restoration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        let mult = 0.15;
        if (this.potency > 0)
            mult = 0.35;
        if (this.potency > 11)
            mult = 1;
        if (this.potency > 21)
            mult = 3;
        const wisCheck = Math.floor(mult * this.getCasterStat(caster, 'wis'));
        const damage = +dice.roll(`${this.potency || 1}d${wisCheck}`);
        this.magicalAttack(caster, target, {
            skillRef,
            atkMsg: `You afflict ${target.name}!`,
            defMsg: `${caster.name} hit you with an affliction!`,
            damage,
            damageClass: 'necrotic'
        });
    }
}
exports.Afflict = Afflict;
//# sourceMappingURL=Afflict.js.map