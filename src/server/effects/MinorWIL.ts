
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorWIL extends Effect {
  effectStart(char: Character) {
    if(char.stats.wil >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.wil += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your aura grows stronger!');
  }
}
