
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BarWater extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#208aec',
    color: '#fff',
    tooltipDesc: 'Negate some water damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 100 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarWater on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Gills form around your neck.');
    char.gainStat('waterResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} water damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your water resistance fades.');
    char.loseStat('waterResist', this.potency * this.potencyMultiplier);
  }
}
