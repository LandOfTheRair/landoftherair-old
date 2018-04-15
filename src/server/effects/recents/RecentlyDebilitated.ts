
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyDebilitated extends SpellEffect {

  iconData = {
    name: 'one-eyed',
    color: '#000',
    tooltipDesc: 'Recently debilitated. +10% perception.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = this.duration || 60;
    this.potency = Math.floor(target.getTotalStat('perception') / 10);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    char.gainStat('perception', this.potency);
  }

  effectEnd(char: Character) {
    char.loseStat('perception', this.potency);
  }
}
