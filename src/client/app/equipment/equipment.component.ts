import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';
import { ColyseusGameService } from '../colyseus.game.service';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent {

  @Input()
  public player: IPlayer;

  @Input()
  public size;

  constructor(public colyseusGame: ColyseusGameService) { }

}
