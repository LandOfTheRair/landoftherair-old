
import { startsWith } from 'lodash';

import { DB } from '../database';
import { Player } from '../../shared/models/player';
import { Pouch } from '../../shared/models/container/pouch';

export class PouchHelper {
  static savePouch(player: Player) {
    return DB.$characterPouches.update(
      { username: player.username },
      { username: player.username, pouch: player.pouch },
      { upsert: true }
    );
  }

  static async loadPouch(player: Player) {
    const data = await DB.$characterPouches.findOne({ username: player.username });
    if(!data) return;

    const { pouch } = data;

    player.pouch = new Pouch(pouch);
  }
}
