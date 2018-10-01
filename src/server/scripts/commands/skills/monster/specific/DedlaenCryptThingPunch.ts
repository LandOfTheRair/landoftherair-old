
import { sample } from 'lodash';

import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { RollerHelper } from '../../../../../../shared/helpers/roller-helper';

export class DedlaenCryptThingPunch extends MonsterSkill {

  name = 'dedlaencryptthingpunch';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range();
  }

  use(user: Character, target: Character) {
    if(!RollerHelper.OneInX(20)) return;

    target.sendClientMessageToRadius(`${target.name} was cast into a tear in the rift!`, 4);
    const allTeleportSpots = user.$$room.state.getDecorByName('CryptThing Spot');

    const spot = sample(allTeleportSpots);
    user.$$room.teleport(target, { x: spot.x / 64, y: (spot.y / 64) - 1 });
  }

}
