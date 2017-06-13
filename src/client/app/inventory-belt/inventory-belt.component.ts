import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-inventory-belt',
  templateUrl: './inventory-belt.component.html',
  styleUrls: ['./inventory-belt.component.scss']
})
export class InventoryBeltComponent {

  @Input()
  public player: Player = new Player({});

  @Input()
  public size;

  public slots = [];

  get maxSize() {
    return 5;
  }

  constructor(public colyseusGame: ColyseusGameService) {
    this.slots = Array(this.maxSize).fill(null).map((v, i) => i);
  }

}
