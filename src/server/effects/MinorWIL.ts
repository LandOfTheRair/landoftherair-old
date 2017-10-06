
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorWIL extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('wil') >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('wil', this.potency);
    this.effectMessage(char, 'Your aura grows stronger!');
  }
}
