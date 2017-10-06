
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorCON extends Effect {
  effectStart(char: Character) {
    if(char.getBaseStat('con') >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(!(<any>this).ignoreHPBoost && char.getBaseStat('hp') < 100) {
      char.gainBaseStat('hp', 3);
    }

    char.gainBaseStat('con', this.potency);
    this.effectMessage(char, 'Your stomach feels stronger!');
  }
}
