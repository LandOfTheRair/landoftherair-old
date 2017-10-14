"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
class BarNecro extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.iconData = {
            name: 'rosa-shield',
            bgColor: '#1b390e',
            color: '#fff'
        };
        this.maxSkillForSkillGain = 7;
        this.potencyMultiplier = 20;
        this.skillFlag = () => character_1.SkillClassNames.Restoration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        if (!this.duration)
            this.duration = 10 * caster.calcSkillLevel(character_1.SkillClassNames.Restoration);
        if (caster !== target) {
            this.casterEffectMessage(caster, `You cast BarNecro on ${target.name}.`);
        }
        target.applyEffect(this);
    }
    effectStart(char) {
        this.targetEffectMessage(char, 'Your body builds a temporary resistance to the dark arts.');
        char.gainStat('necroticResist', this.potency * this.potencyMultiplier);
    }
    effectEnd(char) {
        this.effectMessage(char, 'Your dark arts resistance fades.');
        char.loseStat('necroticResist', this.potency * this.potencyMultiplier);
    }
}
exports.BarNecro = BarNecro;
//# sourceMappingURL=BarNecro.js.map