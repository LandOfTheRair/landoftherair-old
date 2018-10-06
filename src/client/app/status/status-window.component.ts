import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { values } from 'lodash';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-status-window',
  templateUrl: './status-window.component.html',
  styleUrls: ['./status-window.component.scss']
})
export class StatusWindowComponent {

  @LocalStorage()
  public isXPPercent: boolean;

  @LocalStorage()
  public isHPPercent: boolean;

  @LocalStorage()
  public isMPPercent: boolean;
  
  public get player() {
    return this.colyseusGame.character;
  }

  get healthPercent(): number {
    if(!this.player) return 0;

    return Math.floor(this.player.hp.__current / this.player.hp.maximum * 100);
  }

  get magicPercent(): number {
    if(!this.player) return 0;

    // show full bar even if 0/0
    if(this.player.mp.maximum === 0) return 100;
    return Math.floor(this.player.mp.__current / this.player.mp.maximum * 100);
  }

  get xpPercent(): number {
    if(!this.player) return 0;

    const baseXp = this.player.calcLevelXP(this.player.level);
    const neededXp = this.player.calcLevelXP(this.player.level + 1);
    return Math.floor(Math.min(100, (this.player.exp - baseXp) / (neededXp - baseXp) * 100));
  }

  get allEffects(): any[] {
    if(!this.player) return [];
    return values(this.player.effects);
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  tryUnapplying(effect) {
    this.colyseusGame.tryEffectUnapply(effect);
  }
}
