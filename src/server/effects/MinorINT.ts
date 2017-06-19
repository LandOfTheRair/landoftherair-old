
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorINT extends Effect {
  effectStart(char: Character) {
    if(char.stats.int >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.int += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your head is swimming with knowledge!');
  }
}
