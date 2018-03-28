
import { filter } from 'lodash';

import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';
import { DefaultAIBehavior } from './default';
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

    const livingAcolytes = filter(acolytes, (ac: Character) => ac && !ac.isDead());
    if(livingAcolytes.length > 0) {
      if(this.ticks % 5 !== 0) return;
      char.hp.add(char.hp.maximum * 0.04 * livingAcolytes.length);
      return;
    }

    this.effectEnd(char);
    char.unapplyEffect(this);
  }
}

export class CrazedSaraxaAIBehavior extends DefaultAIBehavior {

  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private async spawnAcolyte(spawnId: number) {
    const npc = this.npc;

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
  }

  async mechanicTick() {

    const npc = this.npc;

    // oh yes, these acolytes can respawn
    if(npc.hp.gtePercent(90)) this.trigger75 = false;
    if(npc.hp.gtePercent(65)) this.trigger50 = false;
    if(npc.hp.gtePercent(40)) this.trigger25 = false;

    if(!this.trigger75 && npc.hp.ltPercent(75)) {
      this.trigger75 = true;

      await this.spawnAcolyte(1);
    }

    if(!this.trigger50 && npc.hp.ltPercent(50)) {
      this.trigger50 = true;

      await this.spawnAcolyte(2);
    }

    if(!this.trigger25 && npc.hp.ltPercent(25)) {
      this.trigger25 = true;

      await this.spawnAcolyte(3);
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
