
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class MagicShield extends SpellEffect {

  iconData = {
    name: 'energy-shield',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Negate some physical damage.'
  };

  maxSkillForSkillGain = 15;
  potencyMultiplier = 3;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast MagicShield on ${target.name}.`);
    }

    this.aoeAgro(caster, 100);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your skin hardens.');
    this.gainStat(char, 'physicalResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} physical damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your skin softens.');
  }
}
