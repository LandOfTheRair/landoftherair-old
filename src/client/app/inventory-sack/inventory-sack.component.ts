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
  public size;

  get player(): Player {
    return this.colyseusGame.character;
  }

  get maxSize() {
    return this.player.sack.size;
  }

  get slots(): number[] {
    return Array(this.maxSize).fill(null).map((v, i) => i).reverse();
  }

  constructor(public colyseusGame: ColyseusGameService) {}

}
