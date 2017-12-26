
import { Look } from './Look';
import { Player } from '../../../../shared/models/player';

import { compact, endsWith } from 'lodash';

export class Search extends Look {

  static macroMetadata = {
    name: 'Search',
    macro: '~search',
    icon: 'cash',
    color: '#665600',
    mode: 'autoActivate',
    tooltipDesc: 'Look at the ground and search containers for items.'
  };

  public name = '~search';

  execute(player: Player, { room, gameState, args }) {
    const items = gameState.getGroundItems(player.x, player.y);

    if(items.Corpse) {
      items.Corpse.forEach(corpse => {
        room.dropCorpseItems(corpse, player);
      });
    }

    const chest = gameState.findChest(player.x, player.y);

    if(chest) {
      room.dropChestItems(chest, player);
    }

    super.execute(player, { room, gameState, args });
  }

}
