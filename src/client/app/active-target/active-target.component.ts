import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { find, values, extend } from 'lodash';
import { timer } from 'rxjs/index';

@Component({
  selector: 'app-active-target',
  templateUrl: './active-target.component.html',
  styleUrls: ['./active-target.component.scss']
})
export class ActiveTargetComponent implements OnInit, OnDestroy {

  player$: any;

  public dirString: string;

  private effect$: any;
  public effects = [];

  get target() {
    return this.colyseusGame.clientGameState.activeTarget;
  }

  get character() {
    return this.colyseusGame.clientGameState.currentPlayer;
  }

  get targetEffects() {
    return values(this.target.effects);
  }

  get shouldShowBox() {
    return this.target && this.character && this.target.hp.__current > 0 && this.character.canSeeThroughStealthOf(this.target);
  }

  get targetHealth() {
    return ((this.target.hp.__current / this.target.hp.maximum) * 100).toFixed(2);
  }

  get hostility() {
    return this.colyseusGame.hostilityLevelFor(this.target);
  }

  get isDifficult() {
    return this.target.level > this.colyseusGame.character.level + 5;
  }

  constructor(private colyseusGame: ColyseusGameService) { }

  ngOnInit() {
    this.player$ = this.colyseusGame.clientGameState.playerBoxes$.subscribe(({ newPlayer }) => {
      this.verifyAndUpdateTarget();
      this.distanceCheckAndClearTarget(newPlayer);
    });

    this.effect$ = timer(0, 1000).subscribe(() => {
      this.recalculateEffects();
    });
  }

  ngOnDestroy() {
    this.player$.unsubscribe();
    this.effect$.unsubscribe();
  }

  verifyAndUpdateTarget() {
    if(!this.target) return;

    const target = find(this.colyseusGame.clientGameState.allCharacters, { uuid: this.target.uuid });
    if(!target) return;

    this.colyseusGame.clientGameState.activeTarget = target;
    this.dirString = this.colyseusGame.directionTo(target);
  }

  // clear active target if we get >=5 spaces away or they go behind a wall
  distanceCheckAndClearTarget(player) {
    if(!this.target) return;

    const clear = () => {
      this.colyseusGame.clientGameState.activeTarget = null;
    };

    if(this.target.isDead()) return clear();

    const xDiff = this.target.x - player.x;
    const yDiff = this.target.y - player.y;

    const fov = this.colyseusGame.clientGameState.fov;

    if(!fov) return clear();
    if(!fov[xDiff]) return clear();
    if(!fov[xDiff][yDiff]) return clear();

  }

  private recalculateEffects() {
    if(!this.target) {
      this.effects = [];
      return;
    }

    const newEffects = this.targetEffects;
    this.effects.length = newEffects.length;

    for(let i = 0; i < newEffects.length; i++) {

      if(!this.effects[i]) {
        this.effects[i] = newEffects[i];

      } else {
        Object.keys(this.effects[i]).forEach(key => delete this.effects[i][key]);
        extend(this.effects[i], newEffects[i]);
      }

    }
  }

}
