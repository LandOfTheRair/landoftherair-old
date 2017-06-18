import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-inventory-kubby',
  templateUrl: './inventory-kubby.component.html',
  styleUrls: ['./inventory-kubby.component.scss']
})
export class InventoryKubbyComponent {

  @Input()
  public player: Player = new Player({});

  @Input()
  public size;

  public slots = [];

  get maxSize() {
    return 20;
  }

  constructor(public colyseusGame: ColyseusGameService) {
    this.slots = Array(this.maxSize).fill(null).map((v, i) => i).reverse();
  }

}
