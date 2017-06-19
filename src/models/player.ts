
import { Character } from './character';

export class Player extends Character {
  _id?: any;

  username: string;
  charSlot: number;
  isGM: boolean;

  $fov: any;
  $doNotSave: boolean;

  init() {
    this.initBelt();
    this.initSack();
    this.initGear();
    this.initHands();
    this.recalculateStats();
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
    return Math.floor(item.value / valueMod);
  }

  sendClientMessage(message) {
    this.$room.sendPlayerLogMessage(this, message);
  }
}
