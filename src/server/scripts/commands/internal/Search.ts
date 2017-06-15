
import { Look } from './Look';
import { Player } from '../../../../models/player';

import { compact, endsWith } from 'lodash';

export class Search extends Look {

  public name = '~search';

  execute(player: Player, { room, client, gameState, args }) {
    const items = gameState.getGroundItems(player.x, player.y);

    if(items.Corpse) {
      items.Corpse.forEach(corpse => {
        room.dropCorpseItems(corpse);
      });
    }

    super.execute(player, { room, client, gameState, args });
  }

}
