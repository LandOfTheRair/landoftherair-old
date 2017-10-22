
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class RecentlyStunned extends SpellEffect {

  iconData = {
    name: 'knockout',
    color: '#a00'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 5;
    target.applyEffect(this);
  }
}
