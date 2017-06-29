
import { Effect, Maxes } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';

export class Antidote extends Effect {

  effectStart(char: Character) {
    const poison = char.hasEffect('Poison');
    if(poison) {
      char.unapplyEffect(poison);
    }

    this.effectMessage(char, 'Your stomach feels better.');
  }
}
