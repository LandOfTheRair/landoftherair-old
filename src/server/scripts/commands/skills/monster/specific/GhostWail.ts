

import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Stun, Frosted } from '../../../../../effects';

import { every, some, clamp } from 'lodash';
import { CharacterHelper } from '../../../../../helpers/character/character-helper';
import { RollerHelper } from '../../../../../../shared/helpers/roller-helper';

export class GhostWail extends MonsterSkill {

  name = 'ghostwail';

  mpCost(user: Character) { return Math.floor(user.mp.maximum / 2); }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    const inRange = user.$$room.state.getPlayersInRange(user, 10);
    return super.canUse(user, target)
        && inRange.length > 0
        && some(inRange, char => char.getTotalStat('wil') < 23)
        && every(inRange, char => !char.hasEffect('RecentlyFrosted') && !char.hasEffect('Frosted'));
  }

  use(user: Character, target: Character) {
    user.setCombatTicks(30);

    user.sendClientMessageToRadius('You hear a terrifying wail!', 5);

    user.$$room.state.getPlayersInRange(user, 10).forEach(char => {

      const successChance = clamp((23 - target.getTotalStat('wil')) + 4, 0, 8) * 12.5;

      if(RollerHelper.XInOneHundred(successChance)) {
        char.sendClientMessage(`You resisted the wail of the ghost!`);
        return;
      }

      const stunned = new Stun({ potency: 20, duration: 5 });
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
