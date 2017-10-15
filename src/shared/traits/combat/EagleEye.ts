
import { Trait } from '../../models/trait';

export class EagleEye extends Trait {

  static traitName: string = 'EagleEye';
  static description = 'Sharpen your vision, increasing your accuracy.';
  static icon: string = 'bullseye';

  static tpCost = 10;
  static maxLevel = 10;

}
