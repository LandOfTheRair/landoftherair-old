
import { random, sample } from 'lodash';
import { Player } from '../../../shared/models/player';
import { MoveHelper } from '../../helpers/character/move-helper';
import { DefaultAIBehavior } from './default';

export class DedlaenEscortAIBehavior extends DefaultAIBehavior {
  tick() {

    const npc = this.npc;

    if(npc.isDead()) return;
    if(npc.hostility === 'Never') return;

    let diffX = 0;
    let diffY = 0;

    const targetsInRange = npc.$$room.state.getPlayersInRange(npc, 5);

    let target: Player = null;
    targetsInRange.forEach((possibleTarget: Player) => {
      target = possibleTarget;
    });

    npc.$$following = !!target;

    let responses = [];

    // do movement
    const moveRate = npc.getTotalStat('move');

    // we see someone with a doll
    if(target) {
      MoveHelper.move(npc, { x: target.x - npc.x, y: target.y - npc.y, room: npc.$$room, gameState: npc.$$room.state });

      responses = [
        `Thanks for taking me, ${target.sex === 'Male' ? 'sir' : 'madam'}!`,
        'Are you sure you know where you\'re going?',
        'Are we there yet?'
      ];

      // wander
    } else {
      const oldX = npc.x;
      const oldY = npc.y;
      const numSteps = random(0, moveRate);
      const steps = Array(numSteps).fill(null).map(() => ({ x: random(-1, 1), y: random(-1, 1) }));
      npc.takeSequenceOfSteps(steps);
      diffX = npc.x - oldX;
      diffY = npc.y - oldY;

      responses = [
        `Someone! Help! We're under siege here!`,
        'Can anyone come help us?! Please!',
        'Help!'
      ];

    }

    // spam view chat for fun
    if(random(1, 30) === 1) {
      let response = sample(responses);

      if(responses.length > 1 && response === npc.$$lastResponse) {
        do {
          response = sample(responses);
        } while(response === npc.$$lastResponse);
      }

      npc.$$lastResponse = response;
      const msgObject = { name: npc.name, message: response, subClass: 'chatter' };
      npc.sendClientMessageToRadius(msgObject, 8);
    }

    // change dir
    npc.setDirBasedOnXYDiff(diffX, diffY);

    // check if should leash
    const distFrom = npc.distFrom(npc.spawner);

    if(!npc.$$following && npc.spawner.leashRadius >= 0 && distFrom > npc.spawner.leashRadius) {
      npc.sendLeashMessage();

      npc.x = npc.spawner.x;
      npc.y = npc.spawner.y;
    }
  }

}
