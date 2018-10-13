
import { filter, compact, sample, reject } from 'lodash';

import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';
import { DefaultAIBehavior } from './default';
import { BrotherlyShield, BrotherlySpeed, BrotherlySword, Invulnerable } from './helpers/crazedtonwin-helpers';

export class CrazedTonwinAIBehavior extends DefaultAIBehavior {

  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private brotherSpawnObjects = [
    {
      spawnLoc: 0,
      id: 'Shadow Takwin',
      effect: BrotherlySword,
      message: 'My sword for you, Brother!'
    },
    {
      spawnLoc: 1,
      id: 'Shadow Telwin',
      effect: BrotherlyShield,
      message: 'My shield for you, Brother!'
    },
    {
      spawnLoc: 2,
      id: 'Shadow Terwin',
      effect: BrotherlySpeed,
      message: 'My speed for you, Brother!'
    }
  ];

  private brothers: NPC[] = [];

  public get livingBrothers(): NPC[] {
    return compact(filter(this.brothers, (ac: NPC) => ac && !ac.isDead()));
  }

  private async spawnBrother() {
    const npc = this.npc;

    const spawnObj = sample(this.brotherSpawnObjects);
    if(!spawnObj) throw new Error(`Invalid spawn obj, ${JSON.stringify(this.brotherSpawnObjects)} is left`);

    const { spawnLoc, id, effect, message } = spawnObj;

    // make it so that brother can't spawn again
    this.brotherSpawnObjects = reject(this.brotherSpawnObjects, (data) => data.id === id);

    const msgObject = { name: npc.name, message: `BROTHER ${id.split(' ')[1].toUpperCase()}! JOIN ME!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 10);

    const npcSpawner = npc.$$room.getSpawnerByName(`Brother Spawner ${spawnLoc + 1}`);
    const brother = await npcSpawner.createNPC({ npcId: id });

    // give the brother effect
    const brotherEffect = new effect({ shouldShowMessage: false, ignoreDefenseLoss: true, ignoreStun: true });
    brotherEffect.cast(brother, npc, null);
    brotherEffect.cast(npc, brother, null);

    // make tonwin invuln
    const buff = new Invulnerable({});
    buff.cast(npc, npc, null, this);

    // open the door
    npc.$$room.state.toggleDoor(npc.$$room.state.getInteractableByName(`Tile Door ${spawnLoc + 1}`), true);

    // add it to the array (for the invuln buff)
    this.brothers[spawnLoc] = brother;

    brother.$$ai.death.add(() => {
      this.brothers[spawnLoc] = null;
    });

    // add another message from the brother
    const brotherMessage = { name: npc.name, message, subClass: 'environment' };
    npc.sendClientMessageToRadius(brotherMessage, 10);
  }

  private async tonwinUnsheathe() {
    const itemChoice = sample(['Crazed Tonwin Shield', 'Crazed Tonwin Flail']);
    const newItem = await this.npc.$$room.itemCreator.getItemByName(itemChoice);
    this.npc.leftHand = newItem;
    this.npc.recalculateStats();
    this.npc.$$room.syncNPC(this.npc);
  }

  async mechanicTick() {

    const npc = this.npc;

    // oh yes, these acolytes can respawn
    if(npc.hp.gtePercent(90)) this.trigger75 = false;
    if(npc.hp.gtePercent(65)) this.trigger50 = false;
    if(npc.hp.gtePercent(40)) this.trigger25 = false;

    if(!this.trigger75 && npc.hp.ltPercent(75)) {
      this.trigger75 = true;

      await this.spawnBrother();
    }

    if(!this.trigger50 && npc.hp.ltPercent(50)) {
      this.trigger50 = true;

      await this.tonwinUnsheathe();
      await this.spawnBrother();
    }

    if(!this.trigger25 && npc.hp.ltPercent(25)) {
      this.trigger25 = true;

      await this.spawnBrother();
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
