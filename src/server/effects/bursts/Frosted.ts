
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyFrosted } from '../recents/RecentlyFrosted';

export class Frosted extends SpellEffect {

  iconData = {
    name: 'cold-heart',
    color: '#000080',
    tooltipDesc: 'Actions are 50% slower.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.effectInfo = { damage: 0, caster: '', isFrozen: false };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'A layer of frost forms on your skin!');
  }

  effectTick(char: Character) {
    this.effectInfo.isFrozen = !this.effectInfo.isFrozen;
  }

  effectEnd(char: Character) {
    const recently = new RecentlyFrosted({});
    recently.cast(char, char);
    this.effectMessage(char, 'The frost melts from your skin.');
  }
}
