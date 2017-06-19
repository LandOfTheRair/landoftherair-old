
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorHP extends Effect {
  effectStart(char: Character) {
    if(char.stats.hp >= 200) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.hp += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'You feel like you could take on the world!');
  }
}
