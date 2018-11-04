
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { BarFire } from '../';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class FillLava extends Effect {
  effectStart(char: Character) {

    const hpLost = Math.floor(char.hp.maximum * 5);

    CombatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: 'fire',
      damageMessage: 'The lava incinerates your insides!',
      suppressIfNegative: true,
      overrideSfx: ''
    });

    if(!char.isDead()) {
      const hp = Math.floor(char.hp.maximum / 100);

      const bf = new BarFire({ duration: 7200, potencyMultiplier: 1, potency: hp });

      bf.shouldNotShowMessage = true;
      bf.cast(char, char);
      bf.shouldNotShowMessage = false;
    }
  }
}
