
import { Effect} from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Maxes } from '../../../shared/interfaces/effect';

export class PermanentSTR extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('str') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('str', this.potency);
    this.effectMessage(char, 'Your muscles are bulging!');
  }
}
