
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { merge } from 'lodash';
import { Spawner } from '../../../base/Spawner';
import { NPCLoader } from '../../../helpers/npc-loader';

export class GMSpawnNPC extends Command {

  public name = '@spawnnpc';
  public format = 'Props...';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    if(!args) return false;

    const mergeObj = this.getMergeObjectFromArgs(args);

    console.log(mergeObj);

    /*
      - npc.npcId=""
      - spawner.* (adjust properties for the spawner

      then create a new spawner, give it the npc id.
     */

    const defaultSpawner = {
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 10,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true
    };

    const defaultNpc = {
      npcId: ''
    };

    if(!mergeObj.npc || !mergeObj.npc.npcId) return player.sendClientMessage('You must specify npc.npcId!');

    const spawnerOpts = merge(defaultSpawner, mergeObj.spawner || {});
    const npcOpts = merge(defaultNpc, mergeObj.npc || {});
    const { npcId } = npcOpts;

    const npcData = await NPCLoader.loadNPCData(npcId);

    if(!npcData) return player.sendClientMessage('That npcId is not valid!');

    spawnerOpts.npcIds = [npcId];

    const spawner = new Spawner(room, player, spawnerOpts);
    room.addSpawner(spawner);

  }
}
