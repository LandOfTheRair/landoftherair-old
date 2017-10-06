
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class MinorWIS extends Effect {
  effectStart(char: Character) {
    const canGainMP = char.baseClass === 'Healer' && char.getBaseStat('mp') < 200;

    if(char.getBaseStat('wis') >= Maxes.Minor && !canGainMP) {
      return this.effectMessage(char, 'The fluid was tasteless.');
    }

    if(canGainMP) {
      char.gainBaseStat('mp', 2);
    }

    char.gainBaseStat('wis', this.potency);
    char.recalculateStats();
    this.effectMessage(char, 'You feel like you can make better decisions!');
  }
}
