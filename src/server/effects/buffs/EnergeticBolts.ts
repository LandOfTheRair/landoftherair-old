
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class EnergeticBolts extends SpellEffect {

  iconData = {
    name: 'burning-dot',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Increase damage and cost.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 60;

    this.iconData.tooltipDesc = `Boosts MP cost by ${this.potency * 3} and damage by ${this.potency * 5}%`;

    target.applyEffect(this);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your magic bolts are no longer energetic.');
  }
}
