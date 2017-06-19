
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorWIS extends Effect {
  effectStart(char: Character) {
    if(char.stats.wis >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.wis += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'You feel like you can make better decisions!');
  }
}
