
import { random, sample } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';

export class DedlaenCryptThingPunch extends Skill {

  name = 'dedlaencryptthingpunch';
  execute() {}

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range();
  }

  use(user: Character, target: Character) {
    if(random(0, 10) !== 0) return;

    target.sendClientMessageToRadius(`${target.name} was cast into a tear in the rift!`, 4);
    const allTeleportSpots = user.$$room.state.getDecorByName('CryptThing Spot');

    const spot = sample(allTeleportSpots);
    user.$$room.teleport(target, { x: spot.x / 64, y: (spot.y / 64) - 1 });
  }

}
