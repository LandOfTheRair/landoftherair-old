
import { filter } from 'lodash';

import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';
import { tick as defaultTick } from './default';
import { SpellEffect } from '../../base/Effect';

const acolytes: NPC[] = [];

class AcolyteOverseer extends SpellEffect {
  iconData = {
    name: 'ages',
    bgColor: '#a06',
    color: '#fff',
    tooltipDesc: 'Receiving 4% healing per acolyte every 5 seconds.'
  };

  private ticks = 0;

  cast(target: NPC) {
    this.duration = 500;
    target.applyEffect(this);
  }

  effectTick(char: Character) {
    this.ticks++;

    const livingAcolytes = filter(acolytes, ac => ac && !ac.isDead());
    if(livingAcolytes.length > 0) {
      if(this.ticks % 5 !== 0) return;
      char.hp.add(char.hp.maximum * 0.04 * livingAcolytes.length);
      return;
    }

    this.effectEnd(char);
    char.unapplyEffect(this);
  }
}

const spawnAcolyte = async (npc: NPC, spawnId: number) => {
  if(acolytes[spawnId] && !acolytes[spawnId].isDead()) return;

  const msgObject = { name: npc.name, message: `Come forth, my acolyte!`, subClass: 'chatter' };
  npc.sendClientMessageToRadius(msgObject, 10);

  const npcSpawner = npc.$$room.getSpawnerByName(`Acolyte Spawner ${spawnId}`);
  const acolyte = await npcSpawner.createNPC();

  const rockySpawner = npc.$$room.getSpawnerByName('Crazed Saraxa Rocky Spawner');
  if(!rockySpawner.hasAnyAlive()) {
    rockySpawner.createNPC();
  }

  if(!npc.hasEffect('AcolyteOverseer')) {
    const buff = new AcolyteOverseer({});
    buff.cast(npc);
  }

  acolytes[spawnId] = acolyte;

  const acolyteMessageObject = { name: npc.name, message: `The acolyte begins channeling energy back to Crazed Saraxa!`, subClass: 'environment' };
  npc.sendClientMessageToRadius(acolyteMessageObject, 10);
};

let trigger75 = false;
let trigger50 = false;
let trigger25 = false;

export const tick = (npc: NPC, canMove) => {
  defaultTick(npc, canMove);
};

export const mechanicTick = async (npc: NPC) => {

  // oh yes, these acolytes can respawn
  if(npc.hp.gtePercent(90)) trigger75 = false;
  if(npc.hp.gtePercent(65)) trigger50 = false;
  if(npc.hp.gtePercent(40)) trigger25 = false;

  if(!trigger75 && npc.hp.lessThanPercent(75)) {
    trigger75 = true;

    await spawnAcolyte(npc, 1);
  }

  if(!trigger50 && npc.hp.lessThanPercent(50)) {
    trigger50 = true;

    await spawnAcolyte(npc, 2);
  }

  if(!trigger25 && npc.hp.lessThanPercent(25)) {
    trigger25 = true;

    await spawnAcolyte(npc, 3);
  }
};

export const death = (npc: NPC, killer: Character) => {
  const msgObject = { name: npc.name, message: `EeeaAAaarrrGGGgghhhh!`, subClass: 'chatter' };
  npc.sendClientMessageToRadius(msgObject, 50);
  npc.sendClientMessageToRadius('You hear a lock click in the distance.', 50);

  npc.$$room.state.getInteractableByName('Chest Door').properties.requireLockpick = false;
};
