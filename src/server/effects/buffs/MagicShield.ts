
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class MagicShield extends SpellEffect {

  iconData = {
    name: 'vibrating-shield',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Negate some physical damage.'
  };

  maxSkillForSkillGain = 15;
  potencyMultiplier = 3;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 30 * caster.calcSkillLevel(SkillClassNames.Conjuration);
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast MagicShield on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your skin hardens.');
    char.gainStat('physicalResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your skin softens.');
    char.loseStat('physicalResist', this.potency * this.potencyMultiplier);
  }
}
