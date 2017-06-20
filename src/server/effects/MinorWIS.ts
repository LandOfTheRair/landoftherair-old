
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorWIS extends Effect {
  effectStart(char: Character) {
    const canGainMP = char.baseClass === 'Healer' && char.stats.mp < 200;

    if(char.stats.wis >= Maxes.Minor && !canGainMP) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(canGainMP) {
      char.stats.mp += 2;
    }

    char.stats.wis += this.potency;
    char.recalculateStats();
    this.effectMessage(char, 'You feel like you can make better decisions!');
  }
}
