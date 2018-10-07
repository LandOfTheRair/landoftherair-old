
import { Effect, Maxes } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { Nourishment } from '../buffs/Nourishment';

export class ThanksgivingLUK extends Effect {
  effectStart(char: Character) {
    const nourish = new Nourishment({ 
      tooltip: '+2 LUK',
      message: 'The cornbread is delicious!',
      stats: { cha: 2 },
      duration: 14400
    });

    nourish.cast(char, char);

    if(char.getBaseStat('luk') < 17 && RollerHelper.XInOneHundred(1)) {
      char.gainBaseStat('luk', 1);
      char.sendClientMessage('You feel more lucky!');
    }
  }
}
