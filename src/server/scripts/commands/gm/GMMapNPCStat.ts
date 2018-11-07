
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { merge } from 'lodash';

export class GMMapNPCStat extends Command {

  public name = '@mapnpcstat';
  public format = 'Props...';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const mergeObj = this.getMergeObjectFromArgs(args);

    player.$$room.state.setRoomStats(mergeObj);

    player.$$room.spawners.forEach(spawner => {
      spawner.recalculateAllStats();
    });

    player.$$room.broadcast({ action: 'log_message', message: `Room NPC Stats Set To: ${args}` });

  }
}
