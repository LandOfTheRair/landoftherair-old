
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugCountMobs extends Command {

  public name = '~~mobs';

  execute(player: Player, { room }) {
    const activeSpawners = room.spawners.reduce((prev, cur) => prev + cur.$$isStayingSlow, 0);
    const alwaysActiveSpawners = room.spawners.reduce((prev, cur) => prev + !cur.canSlowDown, 0);
    const lairNPCs = room.spawners.reduce((prev, cur) => prev + (!cur.canSlowDown ? cur.npcs.length : 0), 0);

    const greenSpawner = find(room.spawners, { name: 'NPC Green Spawner' });
    const greenNPCs = greenSpawner ? greenSpawner.npcs.length : 0;

    player.sendClientMessage(`Currently ${Object.keys(room.state.mapNPCs).length - greenNPCs} NPCs (${lairNPCs - greenNPCs} lair creatures) 
    and ${room.state.players.length} players in ${room.state.mapName}. 
    There are ${room.spawners.length - activeSpawners}/${room.spawners.length} active spawners; ${alwaysActiveSpawners - 1} are lair spawners.`);
  }

}
