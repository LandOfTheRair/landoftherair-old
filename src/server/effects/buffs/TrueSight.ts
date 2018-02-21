
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class TrueSight extends SpellEffect {

  iconData = {
    name: 'all-seeing-eye',
    color: '#00a',
    tooltipDesc: 'Seeing other planes of existence.'
  };

  maxSkillForSkillGain = 7;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if(caster.baseClass === 'Thief') target = caster;
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast TrueSight on ${target.name}.`);
    }

    const usedSkill = this.skillFlag(caster);
    const durationMult = caster.baseClass === 'Healer' ? 30 : 15;
    this.potency = caster.calcSkillLevel(usedSkill) * (caster.baseClass === 'Healer' ? 2 : 1);
    if(!this.duration) this.duration = caster.calcSkillLevel(usedSkill) * durationMult;
    this.updateDurationBasedOnTraits(caster);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your vision expands to see other planes of existence.');
    char.gainStat('perception', this.potency);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');
    char.loseStat('perception', this.potency);
  }
}
