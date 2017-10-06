
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorINT extends Effect {
  effectStart(char: Character) {
    const canGainMP = char.baseClass === 'Mage' && char.getBaseStat('mp') < 200;

    if(char.getBaseStat('int') >= Maxes.Minor && !canGainMP) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(canGainMP) {
      char.gainBaseStat('mp', 2);
    }

    char.gainBaseStat('int', this.potency);
    char.recalculateStats();
    this.effectMessage(char, 'Your head is swimming with knowledge!');
  }
}
