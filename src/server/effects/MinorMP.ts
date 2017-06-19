
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorMP extends Effect {
  effectStart(char: Character) {
    if(char.stats.mp >= 300 || char.stats.mp === 0) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.mp += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your mental capacity has increased!');
  }
}
