
import { sample } from 'lodash';

import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { CombatHelper } from '../../helpers/world/combat-helper';

export class Runeblood extends Effect {
  effectStart(char: Character) {

    const hpLostPercent = sample([0.01, 0.1, 0.2, 0.5, 0.95, 0.99]);
    const hpLostMessage = sample([
      'The blood sears your throat!',
      'The blood makes you vomit!',
      'The blood sends a chill down your spine!',
      'Ewww, blood!'
    ]);

    const hpLost = Math.floor(char.hp.maximum * hpLostPercent);

    CombatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: 'physical',
      damageMessage: hpLostMessage,
      suppressIfNegative: true,
      overrideSfx: ''
    });
  }
}
