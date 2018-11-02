
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { DarkVision, TrueSight, EagleEye } from '../';

export class ChristmasCarrot extends Effect {
  effectStart(char: Character) {

    const dv = new DarkVision({ duration: 7200 });
    const ee = new EagleEye({ duration: 7200 });
    const ts = new TrueSight({ duration: 7200 });

    dv.shouldNotShowMessage = true;
    ee.shouldNotShowMessage = true;
    ts.shouldNotShowMessage = true;

    dv.cast(char, char);
    ee.cast(char, char);
    ts.cast(char, char);

    dv.shouldNotShowMessage = false;
    ee.shouldNotShowMessage = false;
    ts.shouldNotShowMessage = false;

    this.effectMessage(char, { message: 'Your eyes are far-out, man!', sfx: 'spell-buff' });
  }
}
