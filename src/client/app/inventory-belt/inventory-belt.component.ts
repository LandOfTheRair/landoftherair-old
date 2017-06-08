import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-inventory-belt',
  templateUrl: './inventory-belt.component.html',
  styleUrls: ['./inventory-belt.component.scss']
})
export class InventoryBeltComponent {

  @Input()
  public player: Player = new Player({});

  constructor() { }

}
