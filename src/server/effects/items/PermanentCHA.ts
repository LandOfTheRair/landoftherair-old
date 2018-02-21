
import { Effect, Maxes } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

export class PermanentCHA extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('cha') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('cha', this.potency);
    this.effectMessage(char, 'You feel better-looking!');
  }
}
