
import { AllTraits } from '../../traits/trait-hash';
import { Trait } from '../../../shared/models/trait';
import { ICharacter, IPlayer } from '../../../shared/interfaces/character';

export class TraitHelper {

  getTraitByName(trait: string, player: IPlayer): Trait {
    return AllTraits.Common[trait] || AllTraits.Free[trait] || AllTraits[player.baseClass][trait];
  }

  getTraitLevelAndUsageModifier(char: ICharacter, trait: string, level: number): number {

    const traitObj = AllTraits.Common[trait] || AllTraits.Free[trait] || AllTraits[char.baseClass][trait];

    // this will return 0 if you try to use a trait for a class you aren't
    if(!traitObj) return 0;

    return traitObj.usageModifier(level, char);
  }

}
