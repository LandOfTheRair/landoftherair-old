
import { Effect } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class MinorMP extends Effect {
  effectStart(char: Character) {
    const baseMp = char.getBaseStat('mp');
    if(baseMp >= 300 || baseMp === 0) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    char.gainBaseStat('mp', this.potency);
    this.effectMessage(char, 'Your mental capacity has increased!');
  }
}
