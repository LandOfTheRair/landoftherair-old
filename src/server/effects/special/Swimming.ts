
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Drowning } from './Drowning';

export class Swimming extends SpellEffect {

  iconData = {
    name: 'drowning',
    color: '#0aa',
    tooltipDesc: 'You are swimming. Find land soon or you\'ll start drowning!'
  };

  private swimElement: string;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = this.duration || caster.getTotalStat('str');
    this.potency = this.potency || 1;
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    if(this.swimElement !== 'water') char.unapplyEffect(this, true);
  }

  effectEnd(char: Character) {
    const drowning = new Drowning({ swimElement: this.swimElement, potency: this.potency });
    drowning.cast(char, char);
  }
}
