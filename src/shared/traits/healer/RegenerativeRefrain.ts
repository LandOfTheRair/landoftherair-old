
import { Trait } from '../../models/trait';

export class RegenerativeRefrain extends Trait {

  static baseClass = 'Healer';
  static traitName = 'RegenerativeRefrain';
  static description = 'Your Regen spell will have a bonus heal when it fades.';
  static icon = 'star-swirl';

  static upgrades = [
    { cost: 20, capstone: true }
  ];

}
