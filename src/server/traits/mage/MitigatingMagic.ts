
import { Trait } from '../../../shared/models/trait';

export class MitigatingMagic extends Trait {

  static baseClass = 'Mage';
  static traitName = 'MitigatingMagic';
  static description = 'Your Magic Shield spell will increase your mitigation by $5|15$.';
  static icon = 'energy-shield';

  static upgrades = [
    { }
  ];

  static usageModifier(level: number): number {
    return level * 5;
  }

}
