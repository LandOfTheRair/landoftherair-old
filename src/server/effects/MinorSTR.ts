
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class MinorSTR extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('str') >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('str', this.potency);
    this.effectMessage(char, 'Your muscles are bulging!');
  }
}
