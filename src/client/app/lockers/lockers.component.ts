import { Component, Input } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

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

  constructor(public colyseusGame: ColyseusGameService) {
    this.slots = Array(this.maxSize).fill(null).map((v, i) => i).reverse();
  }
}
