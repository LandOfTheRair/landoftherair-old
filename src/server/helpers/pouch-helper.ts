
import { startsWith } from 'lodash';

import { DB } from '../database';
import { Player } from '../../shared/models/player';

export class PouchHelper {
  static async savePouch(player: Player) {
    await DB.$characterPouches.update(
      { username: player.username },
      { username: player.username, pouch: player.pouch },
      { upsert: true }
    );

    return DB.$players.update(
      { username: player.username },
      { $set: { pouch: player.pouch } },
      { multi: true }
    );
  }

  static async loadPouchForUsername(username: string) {
    const data = await DB.$characterPouches.findOne({ username });
    return data ? data.pouch : null;
  }
}
