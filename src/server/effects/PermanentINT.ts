
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class PermanentINT extends Effect {
  effectStart(char: Character) {
    const canGainMP = char.baseClass === 'Mage' && char.getBaseStat('mp') < 200;

    if(char.getBaseStat('int') >= Maxes[this.tier] && !canGainMP) {
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
