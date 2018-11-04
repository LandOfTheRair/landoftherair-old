
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { BarFrost } from '../';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class FillChilledWater extends Effect {
  effectStart(char: Character) {

    const hpLost = Math.floor(char.hp.maximum * 0.2);

    CombatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: 'ice',
      damageMessage: 'The water is freezing!',
      suppressIfNegative: true,
      overrideSfx: ''
    });

    if(!char.isDead()) {
      const hp = Math.floor(char.hp.maximum / 100);

      const bf = new BarFrost({ duration: 7200, potencyMultiplier: 1, potency: hp });

      bf.shouldNotShowMessage = true;
      bf.cast(char, char);
      bf.shouldNotShowMessage = false;
    }
  }
}
