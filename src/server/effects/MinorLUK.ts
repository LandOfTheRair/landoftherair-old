
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorLUK extends Effect {
  effectStart(char: Character) {
    if(char.stats.luk >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.luk += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your drink had a four-leaf clover in it!');
  }
}
