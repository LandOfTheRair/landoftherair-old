import { Component, Input } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';
import { MaterialStorageLayout, MaterialSlotInfo } from '../../../shared/helpers/material-storage-layout';

@Component({
  selector: 'app-lockers',
  templateUrl: './lockers.component.html',
  styleUrls: ['./lockers.component.scss']
})
export class LockersComponent {

  @Input()
  public size;

  public slots = [];

  get maxSize() {
    return 15;
  }

  get currentLocker() {
    return this.colyseusGame.showLocker[this.colyseusGame.activeLockerNumber];
  }

  get materialLayout() {
    return MaterialStorageLayout;
  }

  get slotInfo() {
    return MaterialSlotInfo;
  }

  constructor(public colyseusGame: ColyseusGameService) {
    this.slots = Array(this.maxSize).fill(null).map((v, i) => i).reverse();
  }
}
