
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

export class ExactHeal extends Effect {
  effectStart(char: Character) {

    const heal = this.potency + char.getTraitLevelAndUsageModifier('AncientPotions');

    char.hp.add(heal);
    this.effectMessage(char, 'You have been healed.');
  }
}
