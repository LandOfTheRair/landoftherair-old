
import { Effect } from '../../base/Effect';
import { Fate } from '../misc/Fate';
import { Player } from '../../../shared/models/player';

export class FillFateWater extends Effect {
  effectStart(char: Player) {
    const fate = new Fate({});
    fate.cast(char, char);
  }
}
