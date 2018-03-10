
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyHasted extends SpellEffect {

  iconData = {
    name: 'time-trap',
    color: '#000',
    tooltipDesc: 'Recently hasted. Hasting during this period will eat one physical stat.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 60;
    target.applyEffect(this);
  }
}
