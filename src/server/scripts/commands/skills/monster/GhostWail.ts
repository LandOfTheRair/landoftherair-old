

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Stunned, Frosted } from '../../../../effects';

import { every } from 'lodash';
import { CharacterHelper } from '../../../../helpers/character/character-helper';

export class GhostWail extends Skill {

  name = 'ghostwail';
  execute() {}

  mpCost(user: Character) { return Math.floor(user.mp.maximum / 2); }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    const inRange = user.$$room.state.getPlayersInRange(user, 10);
    return super.canUse(user, target)
        && inRange.length > 0
        && every(inRange, char => !char.hasEffect('RecentlyFrosted') && !char.hasEffect('Frosted'));
  }

  use(user: Character, target: Character) {

    user.sendClientMessageToRadius('You hear a terrifying wail!', 5);

    user.$$room.state.getPlayersInRange(user, 10).forEach(char => {

      const stunned = new Stunned({ potency: 20, duration: 5 });
      stunned.shouldNotShowMessage = true;
      stunned.cast(user, char);
      stunned.shouldNotShowMessage = false;

      const frosted = new Frosted({ duration: 25 });
      frosted.shouldNotShowMessage = true;
      frosted.cast(user, char);
      frosted.shouldNotShowMessage = false;

      CharacterHelper.dropHands(char);
    });
  }

}
