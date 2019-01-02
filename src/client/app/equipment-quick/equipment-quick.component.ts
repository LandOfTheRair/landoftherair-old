import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';
import { ColyseusGameService } from '../colyseus.game.service';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-equipment-quick',
  templateUrl: './equipment-quick.component.html',
  styleUrls: ['./equipment-quick.component.scss']
})
export class EquipmentQuickComponent {

  @Input()
  public player: IPlayer;

  @Input()
  public size;

  constructor(public colyseusGame: ColyseusGameService) { }

}
