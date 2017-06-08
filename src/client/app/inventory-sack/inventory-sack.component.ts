import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-inventory-sack',
  templateUrl: './inventory-sack.component.html',
  styleUrls: ['./inventory-sack.component.scss']
})
export class InventorySackComponent {

  @Input()
  public player: Player = new Player({});

  public slots = [];

  get maxSize() {
    return 25;
  }

  constructor() {
    this.slots = Array(this.maxSize).fill(null);
  }

}
