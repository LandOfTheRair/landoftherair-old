
import { startsWith } from 'lodash';

import { DB } from '../database';
import { Player } from '../../shared/models/player';
import { Locker } from '../../shared/models/container/locker';
import { SubscriptionHelper } from './subscription-helper';

export class LockerHelper {

  private static numLockersToSlotArray(maxLockerSlots: number): number[] {
    return Array(maxLockerSlots).fill(null).map((v, i) => -(i + 1));
  }

  private static async createLockerIfNotExist(player, regionId, lockerName, lockerId, forceSlot = null) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: forceSlot || player.charSlot, regionId, lockerId },
      { $setOnInsert: { items: [] }, $set: { lockerName } },
      { upsert: true }
    );
  }

  private static async createSharedLockersIfNotExists(player: Player): Promise<any> {
    const maxLockerSlots = SubscriptionHelper.getSilverPurchase(player.$$account, 'SharedLockers');
    if(maxLockerSlots === 0) return new Promise(resolve => resolve([]));

    const allLockerSlots = this.numLockersToSlotArray(maxLockerSlots);

    return Promise.all(allLockerSlots.map(slotNumber => {
      return this.createLockerIfNotExist(player, 'Shared', `Shared Locker #${Math.abs(slotNumber)}`, `shared${slotNumber}`, slotNumber);
    }));
  }

  static async openLocker(player: Player, lockerName, lockerId) {
    const regionId = player.$$room.mapRegion;

    await this.createLockerIfNotExist(player, regionId, lockerName, lockerId);
    const sharedLockers = await this.createSharedLockersIfNotExists(player);
    const numSharedLockers = sharedLockers.length;

    const baseLockerSlots = this.numLockersToSlotArray(numSharedLockers);
    baseLockerSlots.push(player.charSlot);

    const lockers = await DB.$characterLockers.find({
      username: player.username,
      charSlot: { $in: baseLockerSlots },
      regionId: { $in: [regionId, 'Shared'] }
    }).toArray();

    player.$$room.showLockerWindow(player, lockers, lockerId);
  }

  static async saveLocker(player: Player, locker: Locker) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: locker.charSlot, regionId: locker.regionId, lockerId: locker.lockerId },
      { $set: { lockerName: locker.lockerName, items: locker.allItems } }
    );
  }

  static async loadLocker(player: Player, lockerId): Promise<Locker> {
    if(player.$$locker) {
      const locker = await player.$$locker;
      if(player.$$locker.lockerId === lockerId) return locker;
    }

    let regionId = player.$$room.mapRegion;
    let charSlot = player.charSlot;

    if(startsWith(lockerId, 'shared')) {
      regionId = 'Shared';
      charSlot = +lockerId.substring(lockerId.indexOf('-'));
    }

    player.$$locker = DB.$characterLockers.findOne({ username: player.username, charSlot, regionId, lockerId })
      .then(lock => lock && lock.lockerId ? new Locker(lock) : null);

    return player.$$locker;
  }
}
