
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyImmobilized extends SpellEffect {

  iconData = {
    name: 'web-spit',
    color: '#000',
    tooltipDesc: 'Recently blinded and cannot be blinded for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 5;
    target.applyEffect(this);
  }
}
