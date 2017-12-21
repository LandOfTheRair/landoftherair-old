
import { DB } from '../database';
import { Player } from '../../shared/models/player';
import { Locker } from '../../shared/models/container/locker';

export class LockerHelper {

  private static async createLockerIfNotExist(player, regionId, lockerName, lockerId) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: player.charSlot, regionId, lockerId },
      { $setOnInsert: { items: [] }, $set: { lockerName } },
      { upsert: true }
    );
  }

  private static async openLocker(player: Player, lockerName, lockerId) {
    const regionId = player.$$room.mapRegion;

    await this.createLockerIfNotExist(player, regionId, lockerName, lockerId);
    const lockers = await DB.$characterLockers.find({ username: player.username, charSlot: player.charSlot, regionId }).toArray();

    player.$$room.showLockerWindow(player, lockers, lockerId);
  }

  static async saveLocker(player: Player, locker: Locker) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: player.charSlot, regionId: locker.regionId, lockerId: locker.lockerId },
      { $set: { lockerName: locker.lockerName, items: locker.allItems } }
    );
  }

  static async loadLocker(player: Player, lockerId): Promise<Locker> {
    if(player.$$locker) {
      return await player.$$locker;
    }

    player.$$locker = DB.$characterLockers.findOne({ username: player.username, charSlot: player.charSlot, regionId: player.$$room.mapRegion, lockerId })
      .then(lock => lock && lock.lockerId ? new Locker(lock) : null);

    return player.$$locker;
  }
}
