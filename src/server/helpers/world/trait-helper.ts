
import { AllTraits } from '../../traits/trait-hash';
import { Trait } from '../../../shared/models/trait';
import { ICharacter } from '../../../shared/interfaces/character';

export class TraitHelper {

  getTraitByName(trait: string, char: ICharacter): Trait {
    return AllTraits.Common[trait] || AllTraits.Free[trait] || AllTraits[char.baseClass][trait] || AllTraits.Ancient[trait];
  }

  getTraitLevelAndUsageModifier(char: ICharacter, trait: string, level: number): number {

    const traitObj: any = this.getTraitByName(trait, char);

    // this will return 0 if you try to use a trait for a class you aren't
    if(!traitObj) return 0;

    return traitObj.usageModifier(level, char);
  }

}
