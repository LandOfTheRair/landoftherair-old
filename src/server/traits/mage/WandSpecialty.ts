
import { Trait } from '../../../shared/models/trait';

export class WandSpecialty extends Trait {

  static baseClass = 'Mage';
  static traitName = 'WandSpecialty';
  static description = 'Spells cost $5|15$% less to cast while holding a wand in your right hand.';
  static icon = 'fairy-wand';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 0.05;
  }

}
