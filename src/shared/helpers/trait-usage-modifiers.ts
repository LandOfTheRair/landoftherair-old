import { AllTraits } from '../traits/trait-hash';
import { Character } from '../models/character';

// despite this being in `shared`, it is only ever called server side.
export class TraitUsageModifiers {

  public static getTraitLevelAndUsageModifier(char: Character, trait: string, level: number): number {

    const traitObj = AllTraits.Common[trait] || AllTraits.Free[trait] || AllTraits[char.baseClass][trait];

    // this will return 0 if you try to use a trait for a class you aren't
    if(!traitObj) return 0;

    return traitObj.usageModifier(level);
  }
}
