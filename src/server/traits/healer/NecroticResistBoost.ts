
import { Trait } from '../../../shared/models/trait';

export class NecroticResistBoost extends Trait {

  static baseClass = 'Healer';
  static traitName = 'NecroticResistBoost';
  static description = 'Multiply your poison and disease resist from Bar Necro by $2|6$.';
  static icon = 'rosa-shield';

  static upgrades = [
    { }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
