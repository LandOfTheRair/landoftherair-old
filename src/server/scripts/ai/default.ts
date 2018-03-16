
import { NPC } from '../../../shared/models/npc';
import { CommandExecutor } from '../../helpers/command-executor';
import { random, maxBy, sample, sampleSize, clamp, includes, shuffle } from 'lodash';
import { ShieldClasses, WeaponClasses } from '../../../shared/models/item';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

const checkGroundForItems = (npc: NPC) => {
  if(npc.rightHand && npc.leftHand) return;

  const ground = npc.$$room.state.getGroundItems(npc.x, npc.y);

  if(npc.$$hadRightHandAtSpawn && !npc.rightHand && (!npc.leftHand || !npc.leftHand.twoHanded)) {
    WeaponClasses.forEach(itemClass => {
      if(itemClass === 'Shield') return;

      const items = ground[itemClass];
      if(!items || !items.length) return;

      items.forEach(item => {
        if(npc.rightHand || !item.isOwnedBy || !item.isOwnedBy(npc)) return;
        npc.setRightHand(item);
        npc.$$room.removeItemFromGround(item);
      });
    });
  }

  if(!npc.leftHand && (!npc.rightHand || !npc.rightHand.twoHanded)) {
    ShieldClasses.forEach(itemClass => {
      const items = ground[itemClass];
      if(!items || !items.length) return;

      items.forEach(item => {
        if(npc.leftHand || !item.isOwnedBy || !item.isOwnedBy(npc)) return;
        npc.setLeftHand(item);
        npc.$$room.removeItemFromGround(item);
      });
    });
  }

};

const findValidAllyInView = (npc: NPC, skillRef: Skill, skill: string) => {
  const allies = npc.$$room.state.getAllAlliesInRange(npc, skillRef.range(npc));
  return sample(allies.filter(ally => CommandExecutor.checkIfCanUseSkill(skill, npc, ally)));
};

export const tick = (npc: NPC, canMove: boolean) => {

  if(npc.isDead()) return;
  if(npc.hostility === 'Never') return;

  let diffX = 0;
  let diffY = 0;

  const targetsInRange = npc.$$room.state.getPossibleTargetsFor(npc, 5);

  let highestAgro: Character = maxBy(targetsInRange, (char: Character) => npc.agro[char.uuid]);
  if(!highestAgro) highestAgro = sample(targetsInRange);

  let currentTarget = highestAgro;

  // do movement
  const moveRate = npc.getTotalStat('move');
  const numSteps = random(0, Math.min(moveRate, npc.path ? npc.path.length : moveRate));

  if(random(0, 10) === 0) {
    checkGroundForItems(npc);
  }

  const attemptSkills = shuffle(sampleSize(npc.usableSkills, Math.min(3, Math.floor(npc.usableSkills.length / 2))));

  let chosenSkill = null;
  let chosenSkillFriendly = false;

  let isThrowing = false;

  attemptSkills.forEach((skill: string) => {
    if(chosenSkill) return;

    if(highestAgro && npc.getAttackDamage(highestAgro, skill) === 0 && npc.getZeroTimes(highestAgro, skill) >= 5) {
      skill = includes(npc.usableSkills, 'Charge') ? 'Charge' : 'Attack';
    }

    if(highestAgro && skill === 'Attack' && npc.rightHand && npc.rightHand.returnsOnThrow) {
      isThrowing = true;
      skill = 'Throw';
    }

    // if it's a buff, it works slightly differently
    const skillRef = CommandExecutor.getSkillRef(skill);
    if(skillRef && skillRef.targetsFriendly) {
      const newTarget = findValidAllyInView(npc, skillRef, skill);
      if(!newTarget) return;

      chosenSkillFriendly = true;
      currentTarget = newTarget;
      chosenSkill = skillRef;
      return;
    }

    if(!currentTarget) return;
    chosenSkill = CommandExecutor.checkIfCanUseSkill(skill, npc, currentTarget);
  });

  // we have a target
  if(highestAgro) {

    npc.$$pathDisrupted = true;

    // use a skill that can hit the target
    if(chosenSkill) {
      let opts = {};
      if(isThrowing) opts = { throwHand: 'right' };
      chosenSkill.use(npc, currentTarget, opts);

    // either move towards target
    } else if(canMove) {
      const oldX = npc.x;
      const oldY = npc.y;

      const steps = [];
      let stepdiffX = clamp(highestAgro.x - npc.x, -moveRate, moveRate);
      let stepdiffY = clamp(highestAgro.y - npc.y, -moveRate, moveRate);

      for(let curStep = 0; curStep < moveRate; curStep++) {
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
  } else if(canMove && npc.path && npc.path.length > 0) {
    if(npc.$$pathDisrupted) {
      npc.$$pathDisrupted = false;
      npc.agro = {};
      npc.x = npc.spawner.x;
      npc.y = npc.spawner.y;
      npc.spawner.assignPath(npc);
    }

    const steps = [];

    for(let i = 0; i < numSteps; i++) {
      const step = npc.path.shift();
      diffX += step.x;
      diffY += step.y;

      steps.push(step);
    }

    npc.takeSequenceOfSteps(steps);

    if(!npc.path.length) {
      npc.spawner.assignPath(npc);
    }

  // we wander
  } else if(canMove) {
    const oldX = npc.x;
    const oldY = npc.y;
    const steps = Array(numSteps).fill(null).map(() => ({ x: random(-1, 1), y: random(-1, 1) }));
    npc.takeSequenceOfSteps(steps);
    diffX = npc.x - oldX;
    diffY = npc.y - oldY;
  }

  if(!highestAgro && chosenSkill && currentTarget) {
    chosenSkill.use(npc, currentTarget);
  }


  // change dir
  npc.setDirBasedOnXYDiff(diffX, diffY);


  // check if should leash
  const distFrom = npc.distFrom(npc.spawner);

  if(npc.spawner.leashRadius >= 0 && distFrom > npc.spawner.leashRadius) {

    npc.sendLeashMessage();

    npc.x = npc.spawner.x;
    npc.y = npc.spawner.y;

    // chasing a player, probably - leash, fix hp, fix agro
    if(distFrom > npc.spawner.leashRadius + 4) {
      npc.hp.toMaximum();
      npc.mp.toMaximum();
      npc.agro = {};
    }

    // if we had a path, re-assign a path
    if(npc.path && npc.path.length > 0) {
      npc.spawner.assignPath(npc);
    }
  }

};
