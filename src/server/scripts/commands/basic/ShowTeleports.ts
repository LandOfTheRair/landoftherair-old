
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

import { sortBy, startCase } from 'lodash';

export class ShowTeleports extends Command {

  public name = 'show teleports';

  async execute(player: Player) {
    if(!player.hasLearned('Teleport')) return player.sendClientMessage('You do not know how to teleport.');

    const allTeleports = await player.$$room.teleportHelper.listTeleports(player);

    const sortedTeleports = sortBy(allTeleports, t => t.location.toLowerCase());

    player.sendClientMessage(`Your teleports (${allTeleports.length}/${player.$$room.maxTeleportLocations}):`);

    sortedTeleports.forEach((tp, i) => {
      player.sendClientMessage(`· ${i + 1}: ${tp.location} - ${startCase(tp.teleport.map)} (${tp.teleport.region})`);
    });
  }

}
