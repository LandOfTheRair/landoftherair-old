
import { Effect } from '../../base/Effect';
import { Character} from '../../../shared/models/character';
import { Fate } from '../misc/Fate';

export class FillFateWater extends Effect {
  effectStart(char: Character) {
    const fate = new Fate({});
    fate.cast(char, char);
  }
}
