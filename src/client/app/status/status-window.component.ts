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
    // show full bar even if 0/0
    if(this.colyseusGame.character.mp.maximum === 0) return 100;
    return this.colyseusGame.character.mp.__current / this.colyseusGame.character.mp.maximum * 100;
  }

  get xpPercent(): number {
    const baseXp = this.colyseusGame.character.calcLevelXP(this.colyseusGame.character.level);
    const neededXp = this.colyseusGame.character.calcLevelXP(this.colyseusGame.character.level + 1);
    return Math.min(100, (this.colyseusGame.character.exp - baseXp) / (neededXp - baseXp) * 100);
  }
}
