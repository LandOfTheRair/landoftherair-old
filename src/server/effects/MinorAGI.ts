
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class MinorAGI extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('agi') >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('agi', this.potency);
    char.recalculateStats();
    this.effectMessage(char, 'You feel like you could run faster!');
  }
}
