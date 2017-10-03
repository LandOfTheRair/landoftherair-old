
import { Effect, Maxes, SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { Skill } from '../base/Skill';

export class TrueSight extends SpellEffect {

  iconData = {
    name: 'all-seeing-eye',
    color: '#00a'
  };

  maxSkillForSkillGain = 7;
  skillFlag = (caster) => caster.baseClass === 'Healer' ? SkillClassNames.Restoration : SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast TrueSight on ${target.name}.`);
    }

    const usedSkill = this.skillFlag(caster);
    const durationMult = caster.baseClass === 'Healer' ? 20 : 10;
    if(!this.duration) this.duration = caster.calcSkillLevel(usedSkill) * durationMult;
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your vision expands to see other planes of existence.');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');
  }
}
