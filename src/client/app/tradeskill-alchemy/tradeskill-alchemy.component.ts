import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-tradeskill-alchemy',
  templateUrl: './tradeskill-alchemy.component.html',
  styleUrls: ['./tradeskill-alchemy.component.scss']
})
export class TradeskillAlchemyComponent {

  slots = Array(8).fill(null).map((x, i) => i);

  get player() {
    return this.colyseusGame.character;
  }

  get disabled(): boolean {
    return false;
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  alchemize() {
    this.colyseusGame.sendRawCommand('alchemize', this.colyseusGame.showAlchemy.uuid);
  }
}
