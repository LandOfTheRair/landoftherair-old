
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyBlinded extends SpellEffect {

  iconData = {
    name: 'evil-eyes',
    color: '#000',
    tooltipDesc: 'Recently blinded and cannot be blinded for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}
