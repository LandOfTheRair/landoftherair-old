
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorCON extends Effect {
  effectStart(char: Character) {
    if(char.stats.con >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.con += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your stomach feels stronger!');
  }
}
