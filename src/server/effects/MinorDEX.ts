
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class MinorDEX extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('dex') >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('dex', this.potency);
    this.effectMessage(char, 'Your eyes feel sharper!');
  }
}
