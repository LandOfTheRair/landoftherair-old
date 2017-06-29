
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorCON extends Effect {
  effectStart(char: Character) {
    if(char.stats.con >= Maxes.Minor && char.stats.hp > 100) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(!(<any>this).ignoreHPBoost && char.stats.hp < 100) {
      char.stats.hp += 3;
    }

    char.stats.con += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your stomach feels stronger!');
  }
}
