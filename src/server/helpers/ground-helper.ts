
import * as scheduler from 'node-schedule';
import { Logger } from '../logger';
import { Item } from '../../shared/models/item';

import { compact, reject, find } from 'lodash';
import { DB } from '../database';
import { GameWorld } from '../rooms/GameWorld';

export class GroundHelper {

  private itemGCArray: any = [];

  constructor(private room: GameWorld) {}

  addItemToGround(ref, item: Item, previouslyStackedItem = null) {

    let baseItem = item;

    if(previouslyStackedItem) {
      const item = find(this.itemGCArray, { uuid: previouslyStackedItem.uuid });
      this.removeItemFromGround(item, true);
      baseItem = previouslyStackedItem;
    }

    this.itemGCArray.push({
      uuid: baseItem.uuid,
      itemClass: baseItem.itemClass,
      x: ref.x,
      y: ref.y
    });

    while(this.itemGCArray.length > this.room.maxItemsOnGround) {
      const item = this.itemGCArray.shift();
      this.removeItemFromGround(item);
    }
  }

  removeItemFromGround(item, fromGW = false) {

    // inf loop protection not called from the game world, called as part of the gc above
    if(!fromGW) {
      this.room.removeItemFromGround(item, true);
      return;
    }

    this.itemGCArray = reject(this.itemGCArray, checkItem => checkItem.uuid === item.uuid);
  }

  watchForItemDecay(): any {
    const rule = new scheduler.RecurrenceRule();
    rule.minute = this.room.decayChecksMinutes;

    return scheduler.scheduleJob(rule, () => {
      this.checkIfAnyItemsAreExpired();
    });
  }

  checkIfAnyItemsAreExpired() {
    const groundItems = this.room.state.groundItems;
    Logger.db(`Checking for expired items.`, this.room.state.mapName);

    Object.keys(groundItems).forEach(x => {
      Object.keys(groundItems[x]).forEach(y => {
        Object.keys(groundItems[x][y]).forEach(itemClass => {
          groundItems[x][y][itemClass] = compact(groundItems[x][y][itemClass].map(i => {
            const expired = this.room.itemCreator.hasItemExpired(i);

            if(expired) {
              const now = Date.now();
              const delta = Math.floor((now - i.expiresAt) / 1000);
              Logger.db(`Item ${i.name} has expired @ ${now} (delta: ${delta}sec).`, this.room.state.mapName, i);
              this.room.removeItemFromGround(i);
            }

            return expired ? null : new Item(i);
          }));
        });
      });
    });
  }

  async loadGround() {
    const opts: any = { mapName: this.room.state.mapName };
    if((<any>this.room).partyOwner) opts.party = (<any>this.room).partyOwner;

    let obj = await DB.$mapGroundItems.findOne(opts);
    if(!obj) obj = {};
    const groundItems = obj.groundItems || {};

    this.room.state.setGround(groundItems);

    // load existing items onto the ground
    Object.keys(groundItems).forEach(x => {
      Object.keys(groundItems[x]).forEach(y => {
        Object.keys(groundItems[x][y]).forEach(cat => {
          groundItems[x][y][cat].forEach(item => {
            this.addItemToGround(item, item);
          });
        });
      });
    });

    this.checkIfAnyItemsAreExpired();

    DB.$mapGroundItems.remove(opts);
  }

  async saveGround() {
    const opts: any = { mapName: this.room.state.mapName };
    if((<any>this.room).partyOwner) opts.party = (<any>this.room).partyOwner;
    DB.$mapGroundItems.update(opts, { $set: { groundItems: this.room.state.serializableGroundItems(), updatedAt: new Date() } }, { upsert: true });
  }

}
