
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorCHA extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('cha') >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('cha', this.potency);
    this.effectMessage(char, 'You feel better-looking!');
  }
}
