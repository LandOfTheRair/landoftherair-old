
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
    this.initLocker();
    this.initGear();
    this.initHands();
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
    // TODO tie items
  }
}
