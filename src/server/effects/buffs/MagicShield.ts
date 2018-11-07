
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

  private bonusMitigation: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast MagicShield on ${target.name}.`, sfx: 'spell-buff-magical' });
    }

    if(caster === target) {
      this.bonusMitigation = caster.getTraitLevelAndUsageModifier('MitigatingMagic');
    }

    this.aoeAgro(caster, 100);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'Your skin hardens.', sfx: 'spell-buff-magical' });
    this.gainStat(char, 'physicalResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} physical damage.`;

    if(this.bonusMitigation) {
      this.gainStat(char, 'mitigation', this.bonusMitigation);
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} Gain +${this.bonusMitigation} mitigation.`;
    }
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your skin softens.');
  }
}
