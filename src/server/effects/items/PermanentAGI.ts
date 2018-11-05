
import { Effect} from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Maxes } from '../../../shared/interfaces/effect';

export class PermanentAGI extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('agi') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('agi', this.potency);
    char.recalculateStats();
    this.effectMessage(char, 'You feel like you could run faster!');
  }
}
