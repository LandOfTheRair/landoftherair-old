import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-equipment-viewonly',
  templateUrl: './equipment-viewonly.component.html',
  styleUrls: ['./equipment-viewonly.component.scss']
})
export class EquipmentViewOnlyComponent {

  @Input()
  public player: Player = new Player({});

  @Input()
  public size;

  constructor(public colyseusGame: ColyseusGameService) { }

}
