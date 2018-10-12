
import { get } from 'lodash';

import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-tradeskill-alchemy',
  templateUrl: './tradeskill-alchemy.component.html',
  styleUrls: ['./tradeskill-alchemy.component.scss']
})
export class TradeskillAlchemyComponent {

  slots = Array(8).fill(null).map((x, i) => i);

  get items() {
    return get(this.player, 'tradeSkillContainers.alchemy.items', []);
  }

  get player() {
    return this.colyseusGame.character;
  }

  get disabled(): boolean {
    if(!this.player || !this.player.tradeSkillContainers) return true;
    return this.player.tradeSkillContainers.alchemy.reagents.length === 0 || !!this.player.tradeSkillContainers.alchemy.result;
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  alchemize() {
    this.colyseusGame.sendRawCommand('alchemize', this.colyseusGame.showAlchemy.uuid);
  }
}
