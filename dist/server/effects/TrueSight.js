"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../base/Effect");
const character_1 = require("../../models/character");
class TrueSight extends Effect_1.SpellEffect {
    constructor() {
        super(...arguments);
        this.iconData = {
            name: 'all-seeing-eye',
            color: '#00a'
        };
        this.maxSkillForSkillGain = 7;
        this.skillFlag = (caster) => {
            if (caster.baseClass === 'Healer')
                return character_1.SkillClassNames.Restoration;
            if (caster.baseClass === 'Mage')
                return character_1.SkillClassNames.Conjuration;
            return character_1.SkillClassNames.Thievery;
        };
    }
    cast(caster, target, skillRef) {
        this.setPotencyAndGainSkill(caster, skillRef);
        if (caster !== target) {
            this.casterEffectMessage(caster, `You cast TrueSight on ${target.name}.`);
        }
        const usedSkill = this.skillFlag(caster);
        const durationMult = caster.baseClass === 'Healer' ? 20 : 10;
        if (!this.duration)
            this.duration = caster.calcSkillLevel(usedSkill) * durationMult;
        target.applyEffect(this);
    }
    effectStart(char) {
        this.targetEffectMessage(char, 'Your vision expands to see other planes of existence.');
    }
    effectEnd(char) {
        this.effectMessage(char, 'Your vision returns to normal.');
    }
}
exports.TrueSight = TrueSight;
//# sourceMappingURL=TrueSight.js.map