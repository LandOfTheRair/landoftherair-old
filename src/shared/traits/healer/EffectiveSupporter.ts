
import { Trait } from '../../models/trait';

export class EffectiveSupporter extends Trait {

  static baseClass = 'Healer';
  static traitName = 'EffectiveSupporter';
  static description = 'Your support spells last 10% longer per point.';
  static icon = 'burning-passion';

  static upgrades = [
    { requireCharacterLevel: 15 }, { }, { capstone: true }
  ];

}
