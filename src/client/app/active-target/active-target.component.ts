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
    this.colyseusGame.clientGameState.activeTarget = target;
  }

  // clear active target if we get >=5 spaces away
  distanceCheckAndClearTarget(player) {
    if(!this.target) return;

    if(player.distFrom(this.target) < 5) return;
    this.colyseusGame.clientGameState.activeTarget = null;
  }

}
