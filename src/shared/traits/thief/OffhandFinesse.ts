
import { Trait } from '../../models/trait';

export class OffhandFinesse extends Trait {

  static baseClass = 'Thief';
  static traitName = 'OffhandFinesse';
  static description = 'Increase your offhand attack damage by 10% per point.';
  static icon = 'crossed-sabres';

  static upgrades = [
    { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
