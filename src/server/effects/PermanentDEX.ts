
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class PermanentDEX extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('dex') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('dex', this.potency);
    this.effectMessage(char, 'Your eyes feel sharper!');
  }
}
