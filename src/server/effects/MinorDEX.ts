
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorDEX extends Effect {
  effectStart(char: Character) {
    if(char.stats.dex >= Maxes.Minor) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.stats.dex += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your eyes feel sharper!');
  }
}
