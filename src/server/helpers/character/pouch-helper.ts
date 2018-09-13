
import { DB } from '../../database';
import { Player } from '../../../shared/models/player';

export class PouchHelper {
  static async savePouch(player: Player) {
    try {
      await DB.$characterPouches.update(
        { username: player.username },
        { username: player.username, pouch: player.pouch },
        { upsert: true }
      );
    } catch(e) {

      // https://github.com/LandOfTheRair/landoftherair/issues/845
      // if two workers try to do this at the same time (somehow), this error is thrown.
      // we can ignore it.
      // if any errors related to pouch saving come up later, this is probably the culprit.
      if(e.name !== 'MongoError' || e.code !== 11000) {
        throw e;
      }
    }

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
