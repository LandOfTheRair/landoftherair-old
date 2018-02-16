
import { SpellEffect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class RecentlyBurned extends SpellEffect {

  iconData = {
    name: 'fire',
    color: '#000',
    tooltipDesc: 'Recently burned and cannot be burned for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}
