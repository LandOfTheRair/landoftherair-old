
import { SpellEffect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class RecentlyStunned extends SpellEffect {

  iconData = {
    name: 'knockout',
    color: '#000',
    tooltipDesc: 'Recently stunned and cannot be stunned for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 5;
    target.applyEffect(this);
  }
}
