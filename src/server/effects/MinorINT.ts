
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorINT extends Effect {
  effectStart(char: Character) {
    const canGainMP = char.baseClass === 'Mage' && char.stats.mp < 200;

    if(char.stats.int >= Maxes.Minor && !canGainMP) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(canGainMP) {
      char.stats.mp += 2;
    }

    char.stats.int += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'Your head is swimming with knowledge!');
  }
}
