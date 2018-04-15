
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlySnared extends SpellEffect {

  iconData = {
    name: 'light-thorny-triskelion',
    color: '#000',
    tooltipDesc: 'Recently snared and cannot be snared for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}
