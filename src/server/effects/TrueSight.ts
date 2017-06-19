
import { Effect, Maxes } from '../base/Effect';
import { Character } from '../../models/character';

export class TrueSight extends Effect {

  iconData = {
    name: 'all-seeing-eye',
    color: '#00a'
  };

  effectStart(char: Character) {
    this.effectMessage(char, 'Your vision expands to see other planes of existence.');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');
  }
}
