
import * as scheduler from 'node-schedule';
import { Logger } from '../logger';
import { Item } from '../../shared/models/item';

import { compact } from 'lodash';
import { DB } from '../database';

export class GroundHelper {
  static watchForItemDecay(room): any {
    const rule = new scheduler.RecurrenceRule();
    rule.minute = room.decayChecksMinutes;

    return scheduler.scheduleJob(rule, () => {
      this.checkIfAnyItemsAreExpired(room);
    });
  }

  static checkIfAnyItemsAreExpired(room) {
    const groundItems = room.state.groundItems;
    Logger.db(`Checking for expired items.`, room.state.mapName);

    Object.keys(groundItems).forEach(x => {
      Object.keys(groundItems[x]).forEach(y => {
        Object.keys(groundItems[x][y]).forEach(itemClass => {
          groundItems[x][y][itemClass] = compact(groundItems[x][y][itemClass].map(i => {
            const expired = room.itemCreator.hasItemExpired(i);

            if(expired) {
              const now = Date.now();
              const delta = Math.floor((now - i.expiresAt) / 1000);
              Logger.db(`Item ${i.name} has expired @ ${now} (delta: ${delta}sec).`, room.state.mapName, i);
            }

            return expired ? null : new Item(i);
          }));
        });
      });
    });
  }

  static async loadGround(room) {
    let obj = await DB.$mapGroundItems.findOne({ mapName: room.state.mapName });
    if(!obj) obj = {};
    const groundItems = obj.groundItems || {};

    GroundHelper.checkIfAnyItemsAreExpired(this);

    room.state.setGround(groundItems);

    DB.$mapGroundItems.remove({ mapName: room.state.mapName });
  }

  static async saveGround(room) {
    DB.$mapGroundItems.update({ mapName: room.state.mapName }, { $set: { groundItems: room.state.serializableGroundItems() } }, { upsert: true });
  }

}
