import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { find } from 'lodash';

@Component({
  selector: 'app-active-target',
  templateUrl: './active-target.component.html',
  styleUrls: ['./active-target.component.scss']
})
export class ActiveTargetComponent implements OnInit, OnDestroy {

  player$: any;

  public dirString: string;

  get target() {
    return this.colyseusGame.clientGameState.activeTarget;
  }

  get shouldShowBox() {
    return this.target && this.target.hp.__current > 0;
  }

  get targetHealth() {
    return ((this.target.hp.__current / this.target.hp.maximum) * 100).toFixed(2);
  }

  get hostility() {
    return this.colyseusGame.hostilityLevelFor(this.target);
  }

  constructor(private colyseusGame: ColyseusGameService) { }

  ngOnInit() {
    this.player$ = this.colyseusGame.clientGameState.playerBoxes$.subscribe(player => {
      this.verifyAndUpdateTarget();
      this.distanceCheckAndClearTarget(player);
    });
  }

  ngOnDestroy() {
    this.player$.unsubscribe();
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

    if(!player.$fov) return clear();
    if(!player.$fov[xDiff]) return clear();
    if(!player.$fov[xDiff][yDiff]) return clear();

  }

}
