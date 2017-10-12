"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
class BarFrost extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.iconData = {
            name: 'rosa-shield',
            bgColor: '#000080',
            color: '#fff'
        };
        this.maxSkillForSkillGain = 7;
        this.potencyMultiplier = 20;
        this.skillFlag = () => character_1.SkillClassNames.Conjuration;
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        if (!this.duration)
            this.duration = 10 * caster.calcSkillLevel(character_1.SkillClassNames.Conjuration);
        if (caster !== target) {
            this.casterEffectMessage(caster, `You cast BarFrost on ${target.name}.`);
        }
        target.applyEffect(this);
    }
    effectStart(char) {
        this.targetEffectMessage(char, 'Your body builds a temporary resistance to frost.');
        char.gainStat('iceResist', this.potency * this.potencyMultiplier);
    }
    effectEnd(char) {
        this.effectMessage(char, 'Your frost resistance fades.');
        char.loseStat('iceResist', this.potency * this.potencyMultiplier);
    }
}
exports.BarFrost = BarFrost;
//# sourceMappingURL=BarFrost.js.map