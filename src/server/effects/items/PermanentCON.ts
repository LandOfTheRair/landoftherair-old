
import { Effect} from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Maxes } from '../../../shared/interfaces/effect';

export class PermanentCON extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('con') >= Maxes[this.tier]) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(!(<any>this).ignoreHPBoost && char.getBaseStat('hp') < 100) {
      char.gainBaseStat('hp', 3);
    }

    char.gainBaseStat('con', this.potency);
    this.effectMessage(char, 'Your stomach feels stronger!');
  }
}
