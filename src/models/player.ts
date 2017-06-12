
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
  }
}
