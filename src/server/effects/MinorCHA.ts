
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorCHA extends Effect {
  effectStart(char: Character) {
    if(char.stats.cha >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.cha += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'You feel better-looking!');
  }
}
