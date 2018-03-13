
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Absorption extends SpellEffect {

  iconData = {
    name: 'magic-swirl',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Negates some magic damage.'
  };

  maxSkillForSkillGain = 15;
  potencyMultiplier = 4;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Absorption on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to magic.');
    char.gainStat('magicalResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} magic damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your magic resistance fades.');
    char.loseStat('magicalResist', this.potency * this.potencyMultiplier);
  }
}
