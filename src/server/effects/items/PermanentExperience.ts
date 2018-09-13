
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

export class PermanentExperience extends Effect {
  effectStart(char: Character) {
    char.gainExp(this.potency || 0);
    this.effectMessage(char, 'You feel more experienced!');
  }
}
