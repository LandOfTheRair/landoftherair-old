import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-status-window',
  templateUrl: './status-window.component.html',
  styleUrls: ['./status-window.component.scss']
})
export class StatusWindowComponent {

  constructor(public colyseusGame: ColyseusGameService) { }

  get healthPercent(): number {
    return this.colyseusGame.character.hp.__current / this.colyseusGame.character.hp.maximum * 100;
  }

  get magicPercent(): number {
    return this.colyseusGame.character.mp.__current / this.colyseusGame.character.mp.maximum * 100;
  }
}
