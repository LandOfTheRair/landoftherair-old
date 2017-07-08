
import { NPC } from '../../../models/npc';
import { CommandExecutor } from '../../helpers/command-executor';
import { random, sumBy, maxBy, sample, sampleSize, clamp, size } from 'lodash';

export const tick = (npc: NPC) => {

  if(npc.isDead()) return;
  if(npc.hostility === 'Never') return;

  let diffX = 0;
  let diffY = 0;

  const targetsInRange = npc.$$room.state.getPossibleTargetsFor(npc, 5);

  let highestAgro = maxBy(targetsInRange, char => npc.agro[char.uuid]);
  if(!highestAgro) highestAgro = sample(targetsInRange);

  // do movement
  const numSteps = random(0, Math.min(npc.stats.move, npc.path ? npc.path.length : npc.stats.move));

  // we have a target
  if(highestAgro) {

    npc.$$pathDisrupted = true;

    if(npc.combatMessages && random(1, 10) === 1) {
      const msgObject = { name: npc.name, message: sample(npc.combatMessages), subClass: 'chatter' };
      npc.sendClientMessageToRadius(msgObject, 5);
    }

    const attemptSkills = sampleSize(npc.usableSkills, 3);
    let chosenSkill = null;

    let isThrowing = false;

    attemptSkills.forEach(skill => {
      if(chosenSkill) return;
      if(skill === 'Attack' && npc.rightHand && npc.rightHand.returnsOnThrow) {
        isThrowing = true;
        skill = 'Throw';
      }
      chosenSkill = CommandExecutor.checkIfCanUseSkill(skill, npc, highestAgro);
    });

    // use a skill that can hit the target
    if(chosenSkill) {
      let opts = {};
      if(isThrowing) opts = { throwHand: 'right' };
      chosenSkill.use(npc, highestAgro, opts);


    // either move towards target
    } else {
      const oldX = npc.x;
      const oldY = npc.y;

      const steps = [];
      let stepdiffX = clamp(highestAgro.x - npc.x, -npc.stats.move, npc.stats.move);
      let stepdiffY = clamp(highestAgro.y - npc.y, -npc.stats.move, npc.stats.move);

      for(let curStep = 0; curStep < npc.stats.move; curStep++) {
        const step = { x: 0, y: 0 };

        if(stepdiffX < 0) {
          step.x = -1;
          stepdiffX++;
        } else if(stepdiffX > 0) {
          step.x = 1;
          stepdiffX--;
        }

        if(stepdiffY < 0) {
          step.y = -1;
          stepdiffY++;
        } else if(stepdiffY > 0) {
          step.y = 1;
          stepdiffY--;
        }

        steps[curStep] = step;

      }

      npc.takeSequenceOfSteps(steps, true);
      diffX = npc.x - oldX;
      diffY = npc.y - oldY;
    }

  // we have a path
  } else if(npc.path && npc.path.length > 0) {
    if(npc.$$pathDisrupted) {
      npc.$$pathDisrupted = false;
      npc.agro = {};
      npc.x = npc.spawner.x;
      npc.y = npc.spawner.y;
      npc.spawner.assignPath(npc);
    }

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

  // we wander
  } else {
    const oldX = npc.x;
    const oldY = npc.y;
    const steps = Array(numSteps).fill(null).map(() => ({ x: random(-1, 1), y: random(-1, 1) }));
    npc.takeSequenceOfSteps(steps);
    diffX = npc.x - oldX;
    diffY = npc.y - oldY;
  }


  // change dir
  npc.setDirBasedOnXYDiff(diffX, diffY);


  // check if should leash
  const distFrom = npc.distFrom(npc.spawner);

  if(npc.spawner.leashRadius >= 0 && distFrom > npc.spawner.leashRadius) {
    npc.x = npc.spawner.x;
    npc.y = npc.spawner.y;

    // chasing a player, probably - leash, fix hp, fix agro
    if(distFrom > npc.spawner.leashRadius + 4) {
      npc.hp.toMaximum();
      npc.mp.toMaximum();
      npc.agro = {};
    }

    npc.sendLeashMessage();

    // if we had a path, re-assign a path
    if(npc.path && npc.path.length > 0) {
      npc.spawner.assignPath(npc);
    }
  }

};
