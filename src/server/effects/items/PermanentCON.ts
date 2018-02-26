
import { Effect, Maxes } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

export class PermanentCON extends Effect {
  effectStart(char: Character) {
    console.log(this.tier, char.name, this.potency);
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
