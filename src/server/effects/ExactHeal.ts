
import { Effect } from '../base/Effect';
import { Character } from '../../shared/models/character';

export class ExactHeal extends Effect {
  effectStart(char: Character) {
    char.hp.add(this.potency);
    this.effectMessage(char, 'You have been healed.');
  }
}
