

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
    this.loseStat(char, 'move', 5);
  }

  effectEnd(char: Character) {
    const recently = new RecentlyImmobilized({});
    recently.cast(char, char);

    this.effectMessage(char, 'You regain your movement.');
  }
}
