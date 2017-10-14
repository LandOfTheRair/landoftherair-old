import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-inventory-sack',
  templateUrl: './inventory-sack.component.html',
  styleUrls: ['./inventory-sack.component.scss']
})
export class InventorySackComponent {

  @Input()
  public player: Player = new Player({});

  @Input()
  public size;

  public slots = [];

  get maxSize() {
    return 25;
  }

  constructor(public colyseusGame: ColyseusGameService) {
    this.slots = Array(this.maxSize).fill(null).map((v, i) => i).reverse();
  }

}
