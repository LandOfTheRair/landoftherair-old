
import { Look } from './Look';
import { Player } from '../../../../models/player';

import { compact, endsWith } from 'lodash';

export class Search extends Look {

  public name = '~search';

  static macroMetadata = {
    name: 'Search',
    macro: '~search',
    icon: 'cash',
    color: '#665600',
    mode: 'autoActivate'
  };

  execute(player: Player, { room, gameState, args }) {
    const items = gameState.getGroundItems(player.x, player.y);

    if(items.Corpse) {
      items.Corpse.forEach(corpse => {
        room.dropCorpseItems(corpse);
      });
    }

    super.execute(player, { room, gameState, args });
  }

}
