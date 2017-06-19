
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorSTR extends Effect {
  effectStart(char: Character) {
    if(char.stats.str >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.str += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your muscles are bulging!');
  }
}
