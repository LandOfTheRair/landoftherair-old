
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Aid extends SpellEffect {

  iconData = {
    name: 'three-friends',
    color: '#00c',
    tooltipDesc: 'DEX and offense rating boosted'
  };

  maxSkillForSkillGain = 20;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Aid on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    if(!this.duration) this.duration = this.potency * 30;
    this.updateDurationBasedOnTraits(caster);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You feel as if you\'re being given some help from a friend!');

    const dexBoost = Math.floor(this.potency / 5);
    this.gainStat(char, 'dex', dexBoost);

    const offenseBoost = Math.floor(this.potency / 3);
    this.gainStat(char, 'offense', offenseBoost);

    this.iconData.tooltipDesc = `+${dexBoost} DEX, +${offenseBoost} offense.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your aid disappears.');
  }
}
