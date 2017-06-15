
import { NPC } from '../../../models/npc';
import { random, sumBy } from 'lodash';

export const tick = (npc: NPC) => {

  if(npc.isDead()) return;

  let diffX = 0;
  let diffY = 0;

  // do movement
  // TODO agro checks
  const numSteps = random(0, Math.min(npc.stats.move, npc.path ? npc.path.length : npc.stats.move));

  if(npc.path && npc.path.length > 0) {
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
    // TODO should have an else if (something is agro'd in view)
  } else {
    const oldX = npc.x;
    const oldY = npc.y;
    const steps = Array(numSteps).fill(null).map(() => ({ x: random(-1, 1), y: random(-1, 1) }));
    npc.takeSequenceOfSteps(steps);
    diffX = npc.x - oldX;
    diffY = npc.y - oldY;
  }

  npc.setDirBasedOnXYDiff(diffX, diffY);

  // TODO reset agro on leash
  if(npc.distFrom(npc.spawner) > npc.spawner.leashRadius) {
    npc.x = npc.spawner.x;
    npc.y = npc.spawner.y;

    if(npc.path && npc.path.length > 0) {
      npc.spawner.assignPath(npc);
    }
  }

  // TODO check hostility

};
