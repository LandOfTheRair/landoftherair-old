
import { sample } from 'lodash';

import { Character } from '../../../shared/models/character';
import { DefaultAIBehavior } from './default';

export class InsaneRanataAIBehavior extends DefaultAIBehavior {

  private spawnTicks: boolean[] = [];
  private agroTicks: boolean[] = [];

  private spawnInsanes() {
    const npc = this.npc;

    const msgObject = { name: npc.name, message: `Gwahahaha, come forth, my experiments!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 10);

    const npcSpawner = npc.$$room.getSpawnerByName(`Insane Spawner`);
    for(let i = 0; i < 5; i++) {
      npcSpawner.createNPC();
    }
  }

  private fixateOnRandom() {
    const npc = this.npc;

    npc.resetAgro(true);

    const possiblePlayers = npc.$$room.state.getPlayersInRange(npc, 10);
    const target = sample(possiblePlayers);

    npc.addAgro(target, 100000);

    const msgObject = { name: npc.name, message: `Gwahahaha, ${target.name}, you shall be my next target!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 10);
  }

  async mechanicTick() {

    const npc = this.npc;

    for(let i = 1; i < 20; i++) {
      if(npc.hp.ltePercent(i * 5) && !this.spawnTicks[i]) {
        this.spawnTicks[i] = true;
        this.spawnInsanes();
      }
    }

    for(let i = 1; i < 10; i++) {
      if(npc.hp.ltePercent(i * 10) && !this.agroTicks[i]) {
        this.agroTicks[i] = true;
        this.fixateOnRandom();
      }
    }
  }

  death(killer: Character) {
    const npc = this.npc;

    const msgObject = { name: npc.name, message: `EeeaAAaarrrGGGgghhhh!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 50);
    npc.sendClientMessageToRadius('You hear a lock click in the distance.', 50);

    npc.$$room.state.getInteractableByName('Chest Door').properties.requireLockpick = false;
  }
}
