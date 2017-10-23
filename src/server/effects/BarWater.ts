
import { Effect, SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class BarWater extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#208aec',
    color: '#fff',
    tooltipDesc: 'Negate some water damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 100 * caster.calcSkillLevel(SkillClassNames.Conjuration);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarWater on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Gills form around your neck.');
    char.gainStat('waterResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character, opts = { message: true }) {
    super.effectEnd(char, opts);
    this.effectMessage(char, 'Your water resistance fades.');
    char.loseStat('waterResist', this.potency * this.potencyMultiplier);
  }
}
