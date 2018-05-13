
import { Trait } from '../../models/trait';

export class EnergyWaveWiden extends Trait {

  static baseClass = 'Mage';
  static traitName = 'EnergyWaveWiden';
  static description = 'Your Energy Wave spell range is widened by $1|1$ tile.';
  static icon = 'beams-aura';

  static upgrades = [
    { }
  ];

}
