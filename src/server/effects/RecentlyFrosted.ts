
import { SpellEffect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class RecentlyFrosted extends SpellEffect {

  iconData = {
    name: 'cold-heart',
    color: '#000',
    tooltipDesc: 'Recently frosted and cannot be frosted for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}
