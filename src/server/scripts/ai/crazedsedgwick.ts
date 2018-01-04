
import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';
import { tick as defaultTick } from './default';
import { CombatHelper } from '../../helpers/combat-helper';

const blast = (npc: NPC) => {
  const msgObject = { name: npc.name, message: `HIYAAAAAAAAAH! Take THIS!`, subClass: 'chatter' };
  npc.sendClientMessageToRadius(msgObject, 6);

  const players = npc.$$room.state.getPlayersInRange(npc, 7);

  players.forEach(player => {
    if(player.x === 20 && player.y === 5) {
      player.sendClientMessage('A magical barrier protects you from Sedgwick\'s magic!');
      return;
    }

    CombatHelper.magicalAttack(npc, player, {
      atkMsg: `You blast ${player.name} with a wave of energy!`,
      defMsg: `${npc.name} blasted you with a wave of energy!`,
      damage: 1500,
      damageClass: 'energy'
    });
  });
};

let trigger75 = false;
let trigger50 = false;
let trigger25 = false;

export const tick = (npc: NPC, canMove) => {

  defaultTick(npc, canMove);

  if(!trigger75 && npc.hp.ltePercent(75)) {
    trigger75 = true;

    setTimeout(() => {
      blast(npc);
    }, 2000);
  }

  if(!trigger50 && npc.hp.ltePercent(50)) {
    trigger50 = true;

    setTimeout(() => {
      blast(npc);
    }, 2000);
  }

  if(!trigger25 && npc.hp.ltePercent(25)) {
    trigger25 = true;

    setTimeout(() => {
      blast(npc);
    }, 2000);
  }
};

export const death = (npc: NPC, killer: Character) => {
  const msgObject = { name: npc.name, message: `Curse you, ${killer.name}! Curse you to your grave!`, subClass: 'chatter' };
  npc.sendClientMessageToRadius(msgObject, 6);
  npc.sendClientMessageToRadius('You hear a lock click in the distance.', 6);

  npc.$$room.state.getInteractableByName('Chest Door').properties.requireLockpick = false;
};
