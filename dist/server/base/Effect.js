"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const combat_helper_1 = require("../helpers/combat-helper");
exports.Maxes = {
    Lesser: 10,
    Minor: 15
};
class EffectInfo {
}
class Effect {
    constructor(opts) {
        this.name = '';
        this.iconData = {};
        this.duration = 0;
        this.potency = 0;
        this.effectInfo = { caster: '' };
        lodash_1.extend(this, opts);
        if (!this.name)
            this.name = this.constructor.name;
    }
    tick(char) {
        this.effectTick(char);
        this.duration--;
        if (!this.effectInfo.isPermanent && this.duration <= 0) {
            char.unapplyEffect(this);
            this.effectEnd(char);
        }
    }
    effectTick(char) { }
    effectStart(char) { }
    effectEnd(char) { }
    effectMessage(char, message) {
        if (!char)
            return;
        char.sendClientMessage(message);
    }
}
exports.Effect = Effect;
class SpellEffect extends Effect {
    constructor() {
        super(...arguments);
        this.flagSkills = [];
        this.potencyMultiplier = 0;
        this.maxSkillForSkillGain = 0;
    }
    casterEffectMessage(char, message) {
        super.effectMessage(char, { message, subClass: 'spell buff give' });
    }
    targetEffectMessage(char, message) {
        super.effectMessage(char, { message, subClass: 'spell buff get' });
    }
    setPotencyAndGainSkill(caster, skillRef) {
        // called from something like a trap
        if (this.casterRef)
            return;
        if (this.skillFlag) {
            const flaggedSkill = this.skillFlag(caster);
            this.potency = caster.calcSkillLevel(flaggedSkill) + 1;
            const skillGained = this.maxSkillForSkillGain - this.potency;
            if (skillRef && skillGained > 0) {
                caster.gainSkill(flaggedSkill, skillGained);
            }
        }
        else if (!this.potency) {
            this.potency = 1;
        }
    }
    magicalAttack(caster, ref, opts = {}) {
        opts.effect = this;
        // trap casters do not have uuid
        if (!caster.uuid)
            caster = ref;
        combat_helper_1.CombatHelper.magicalAttack(caster, ref, opts);
    }
    getCasterStat(caster, stat) {
        if (this.casterRef)
            return this.casterRef.casterStats[stat];
        return caster.getTotalStat(stat);
    }
    cast(caster, target, skillRef) { }
}
exports.SpellEffect = SpellEffect;
//# sourceMappingURL=Effect.js.map