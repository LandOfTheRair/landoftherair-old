
import { Trait } from '../../../shared/models/trait';

export class EnergeticBolts extends Trait {

  static baseClass = 'Mage';
  static traitName = 'EnergeticBolts';
  static description = 'Your Magic Bolt spell will successively cost 3 more MP (up to +30) per cast and increase the damage by 5% (up to +50%) for seconds.';
  static icon = 'burning-dot';

  static upgrades = [
    { capstone: true, cost: 20 }
  ];

  static usageModifier(level: number): number {
    return level ? 5 : 0;
  }

}
