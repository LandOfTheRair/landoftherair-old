
import { Effect } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class MinorHP extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('hp') >= 200) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('hp', this.potency);
    this.effectMessage(char, 'You feel like you could take on the world!');
  }
}
