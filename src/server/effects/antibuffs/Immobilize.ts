

import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyImmobilized } from '../recents/RecentlyImmobilized';

export class Immobilize extends SpellEffect {

  iconData = {
    name: 'web-spit',
    color: '#fff',
    bgColor: '#000',
    tooltipDesc: 'Immobilized and unable to move.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if(target.getTotalStat('str') > 25) return;

    this.duration = Math.max(2, 20 - target.getTotalStat('str'));
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You are stuck!');
    char.loseStat('move', 5);
  }

  effectEnd(char: Character) {
    const recently = new RecentlyImmobilized({});
    recently.cast(char, char);

    this.effectMessage(char, 'You regain your movement.');
    char.gainStat('move', 5);
  }
}
