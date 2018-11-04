
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { BarWater } from '../';

export class FillNormalWater extends Effect {
  effectStart(char: Character) {

    const hp = Math.floor(char.hp.maximum / 100);
    char.hp.add(Math.floor(char.hp.maximum / 20));

    const bw = new BarWater({ duration: 7200, potencyMultiplier: 1, potency: hp });

    bw.shouldNotShowMessage = true;
    bw.cast(char, char);
    bw.shouldNotShowMessage = false;

    this.effectMessage(char, 'The water is refreshing!');
  }
}
