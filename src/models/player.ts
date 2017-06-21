
import { Character, MaxSizes } from './character';
import { Item } from './item';

import { compact, pull } from 'lodash';

export class Player extends Character {
  _id?: any;

  username: string;
  charSlot: number;
  isGM: boolean;

  buyback: Item[];

  banks: any;

  $fov: any;
  $doNotSave: boolean;

  respawnPoint: { x: number, y: number, map: string };

  init() {
    this.initBelt();
    this.initSack();
    this.initGear();
    this.initHands();
    this.initBuyback();
    this.recalculateStats();
  }

  initBuyback() {
    if(!this.buyback) this.buyback = [];
    this.buyback = this.buyback.map(item => new Item(item));
  }

  initServer() {
    this.initEffects();
  }

  canSee(x, y) {
    if(!this.$fov[x]) return false;
    if(!this.$fov[x][y]) return false;
    return true;
  }

  die(killer) {
    super.die(killer);

    // 5 minutes to restore
    this.$deathTicks = 360 * 5;
  }

  restore(force = false) {
    // TODO set restore point etc
  }

  getSprite() {
    return 725;
  }

  itemCheck(item) {
    super.itemCheck(item);
    if(!item) return;

    if(item.itemClass === 'Corpse') {
      item.$heldBy = this.username;
    }
    // TODO tie items (like the yeti club)
  }

  sellValue(item) {
    // every cha after 10 increases the sale value by ~2%
    const valueMod = 10 - ((this.getTotalStat('cha') - 10) / 5);
    return Math.max(1, Math.floor(item.value / valueMod));
  }

  buybackSize() {
    return MaxSizes.Buyback;
  }

  fixBuyback() {
    this.buyback = compact(this.buyback);
  }

  buyItemBack(slot) {
    const item = this.buyback[slot];
    pull(this.buyback, item);
    this.fixBuyback();
    return item;
  }

  sellItem(item: Item) {
    const value = this.sellValue(item);
    this.addGold(value);
    item._buybackValue = value;

    this.buyback.push(item);

    if(this.buyback.length > this.buybackSize()) this.buyback.shift();
  }

  addBankMoney(region: string, amount: number) {
    amount = Math.round(+amount);
    if(isNaN(amount)) return false;

    if(amount < 0) return false;
    if(amount > this.gold) amount = this.gold;

    this.banks = this.banks || {};
    this.banks[region] = this.banks[region] || 0;
    this.banks[region] += amount;

    this.loseGold(amount);
    return amount;
  }

  loseBankMoney(region, amount) {
    amount = Math.round(+amount);
    if(isNaN(amount)) return false;
    if(amount < 0) return false;
    this.banks = this.banks || {};
    this.banks[region] = this.banks[region] || 0;

    if(amount > this.banks[region]) amount = this.banks[region];

    this.banks[region] -= amount;
    this.addGold(amount);
    return amount;
  }

  sendClientMessage(message) {
    this.$room.sendPlayerLogMessage(this, message);
  }
}
