
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BarFire extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#DC143C',
    color: '#fff',
    tooltipDesc: 'Negate some fire damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 100 * caster.calcSkillLevel(this.skillFlag(caster));
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarFire on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to flame.');
    char.gainStat('fireResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your flame resistance fades.');
    char.loseStat('fireResist', this.potency * this.potencyMultiplier);
  }
}
