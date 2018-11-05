
import { Effect} from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Maxes } from '../../../shared/interfaces/effect';

export class PermanentLUK extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('luk') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('luk', this.potency);
    this.effectMessage(char, 'Your drink had a four-leaf clover in it!');
  }
}
