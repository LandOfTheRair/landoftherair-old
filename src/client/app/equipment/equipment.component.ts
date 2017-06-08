import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent {

  @Input()
  public player: Player = new Player({});

  constructor() { }

}
