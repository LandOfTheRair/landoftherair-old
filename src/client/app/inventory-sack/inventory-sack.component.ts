import { Component, Input } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-inventory-sack',
  templateUrl: './inventory-sack.component.html',
  styleUrls: ['./inventory-sack.component.scss']
})
export class InventorySackComponent {

  @Input()
  public size;

  get player(): IPlayer {
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
