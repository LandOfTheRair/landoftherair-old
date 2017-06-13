
import { NPC } from '../../../models/npc';
import { random } from 'lodash';

export const tick = (npc: NPC) => {

  let diffX = 0;
  let diffY = 0;

  // do movement
  // TODO agro checks
  if(npc.path.length > 0) {
    const numSteps = random(0, Math.min(npc.stats.move, npc.path.length));
    for(let i = 0; i < numSteps; i++) {
      const step = npc.path.shift();
      npc.x += step.x;
      npc.y += step.y;

      diffX += step.x;
      diffY += step.y;
    }

    if(!npc.path.length) {
      npc.spawner.assignPath(npc);
    }
  } else {
    // move randomly but don't step on dense tiles
  }

  npc.setDirBasedOnXYDiff(diffX, diffY);
  // TODO move, check spawner.randomwalk, spawner.leashradius, check for hostility, and attempt to follow path, get new path if current one is empty and spawner has paths

  // TODO if taken off path and have path left, teleport back to start when no more agro
};
