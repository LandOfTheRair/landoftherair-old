
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { BarWater } from '../';

export class FillSpringWater extends Effect {
  effectStart(char: Character) {

    char.hp.add(Math.floor(char.hp.maximum / 5));

    this.effectMessage(char, 'The spring water is refreshing!');
  }
}
