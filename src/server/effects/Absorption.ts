
import { Effect, SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class Absorption extends SpellEffect {

  iconData = {
    name: 'magic-swirl',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Negate some magic damage.'
  };

  maxSkillForSkillGain = 15;
  potencyMultiplier = 4;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 30 * caster.calcSkillLevel(SkillClassNames.Conjuration);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Absorption on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to magic.');
    char.gainStat('magicalResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your magic resistance fades.');
    char.loseStat('magicalResist', this.potency * this.potencyMultiplier);
  }
}
