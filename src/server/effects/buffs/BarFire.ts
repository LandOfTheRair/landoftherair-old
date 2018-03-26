
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
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

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    /** PERK:CLASS:MAGE:Mages have BarFire that is twice as strong. */
    if(caster.baseClass === 'Mage') this.potencyMultiplier *= 2;

    if(!this.duration) this.duration = 100 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarFire on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to flame.');
    char.gainStat('fireResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} fire damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your flame resistance fades.');
    char.loseStat('fireResist', this.potency * this.potencyMultiplier);
  }
}
