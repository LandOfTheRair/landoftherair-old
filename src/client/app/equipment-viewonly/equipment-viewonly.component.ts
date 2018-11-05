import { Component, Input } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-equipment-viewonly',
  templateUrl: './equipment-viewonly.component.html',
  styleUrls: ['./equipment-viewonly.component.scss']
})
export class EquipmentViewOnlyComponent {

  @Input()
  public player: IPlayer;

  @Input()
  public size;

  constructor(public colyseusGame: ColyseusGameService) { }

}
