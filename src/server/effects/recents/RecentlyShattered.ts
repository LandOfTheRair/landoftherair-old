
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyShattered extends SpellEffect {

  iconData = {
    name: 'on-sight',
    color: '#333',
    tooltipDesc: 'Recently had shattered defenses and cannot be shattered for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 60;
    target.applyEffect(this);
  }
}
