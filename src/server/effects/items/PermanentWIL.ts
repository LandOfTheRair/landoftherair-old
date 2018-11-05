
import { Effect} from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Maxes } from '../../../shared/interfaces/effect';

export class PermanentWIL extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('wil') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('wil', this.potency);
    this.effectMessage(char, 'Your aura grows stronger!');
  }
}
