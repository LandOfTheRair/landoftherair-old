import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ClientGameState } from '../clientgamestate';

import { Game } from './phasergame';
import { Player } from '../../../models/player';
import { ColyseusService } from '../colyseus.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  @Input()
  public currentPlayer: Player = new Player({});

  @Input()
  public clientGameState: ClientGameState = new ClientGameState({});

  private phaser: any;
  private game: Game;

  start$: any;

  create$: any;
  update$: any;
  remove$: any;

  started: boolean;

  constructor(private colyseus: ColyseusService) {}

  private cleanCanvases() {
    const elements = document.getElementsByTagName('canvas');
    while(elements[0]) elements[0].parentNode.removeChild(elements[0]);
  }

  ngOnInit() {
    this.start$ = this.clientGameState.setMap$.subscribe((map: any) => {
      if(!map || !map.layers || this.started) return;

      this.started = true;
      this.cleanCanvases();

      // 9x9, tiles are 64x64
      const boxSize = 9 * 64;

      this.game = new Game(this.clientGameState, this.currentPlayer);
      this.game.moveCallback = (x, y) => this.colyseus.game.doMove(x, y);
      this.game.interactCallback = (x, y) => this.colyseus.game.doInteract(x, y);
      this.phaser = new (<any>window).Phaser.Game(boxSize, boxSize, (<any>window).Phaser.CANVAS, 'map', this.game);

      this.colyseus.game.doMove(0, 0);

      this.create$ = this.clientGameState.createPlayer$.subscribe((player) => {
        this.game.canCreate.then(() => {
          this.game.createPlayer(player);
        });
      });

      this.update$ = this.clientGameState.updatePlayer$.subscribe((player) => {
        this.game.canUpdate.then(() => {
          this.game.updatePlayer(player);
        });
      });

      this.remove$ = this.clientGameState.removePlayer$.subscribe((player) => {
        this.game.removePlayer(player);
      });
    });
  }

  ngOnDestroy() {
    this.start$.unsubscribe();

    if(this.create$) this.create$.unsubscribe();
    if(this.update$) this.update$.unsubscribe();
    if(this.remove$) this.remove$.unsubscribe();

    if(this.game) {
      this.game.destroy();
      this.phaser.destroy();

      delete this.game;
      delete this.phaser;
    }

    this.cleanCanvases();
  }

}
