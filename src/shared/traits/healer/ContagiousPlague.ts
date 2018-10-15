
import { Trait } from '../../models/trait';

export class ContagiousPlague extends Trait {

  static baseClass = 'Healer';
  static traitName = 'ContagiousPlague';
  static description = 'Your Plague spell will spread to a nearby target not suffering from Plague once every 3s.';
  static icon = 'death-zone';

  static upgrades = [
    { cost: 15, capstone: true }
  ];

}
