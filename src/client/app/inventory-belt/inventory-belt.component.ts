import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-inventory-belt',
  templateUrl: './inventory-belt.component.html',
  styleUrls: ['./inventory-belt.component.scss']
})
export class InventoryBeltComponent {

  @Input()
  public size;

  get player(): Player {
    return this.colyseusGame.character;
  }

  get maxSize() {
    return this.player.belt.size;
  }

  get slots(): number[] {
    return Array(this.maxSize).fill(null).map((v, i) => i);
  }

  constructor(public colyseusGame: ColyseusGameService) {}

}
