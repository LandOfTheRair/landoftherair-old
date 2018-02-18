import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-inventory-pouch',
  templateUrl: './inventory-pouch.component.html',
  styleUrls: ['./inventory-pouch.component.scss']
})
export class InventoryPouchComponent {

  @Input()
  public size;

  get player(): Player {
    return this.colyseusGame.character;
  }

  get maxSize() {
    return this.player.pouch.size;
  }

  get slots(): number[] {
    return Array(this.maxSize).fill(null).map((v, i) => i);
  }

  constructor(public colyseusGame: ColyseusGameService) {}

}
