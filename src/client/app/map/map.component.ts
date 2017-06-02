import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { ClientGameState } from '../../../models/clientgamestate';

import { Game } from './phasergame';
import { Player } from '../../../models/player';
import { ColyseusService } from '../colyseus.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, OnChanges {

  @Input()
  public currentPlayer: Player = new Player({});

  @Input()
  public clientGameState: ClientGameState = new ClientGameState({});

  private phaser: any;
  private game: Game;

  constructor(private colyseus: ColyseusService) {}

  ngOnInit() {
    // 9x9, tiles are 64x64
    const boxSize = 9 * 64;

    this.game = new Game(this.clientGameState, this.currentPlayer);
    this.game.moveCallback = (x, y) => this.colyseus.game.doMove(x, y);
    this.phaser = new (<any>window).Phaser.Game(boxSize, boxSize, (<any>window).Phaser.CANVAS, 'map', this.game);

    this.clientGameState.createPlayer$.subscribe((player) => {
      this.game.createPlayer(player);
    });

    this.clientGameState.updatePlayer$.subscribe((player) => {
      this.game.updatePlayer(player);
    });

    this.clientGameState.removePlayer$.subscribe((player) => {
      this.game.removePlayer(player);
    })
  }

  ngOnDestroy() {
    if(this.phaser) {
      this.phaser.destroy();
    }

    const elements = document.getElementsByTagName('canvas');
    while(elements[0]) elements[0].parentNode.removeChild(elements[0]);
  }

  ngOnChanges() {
    if(!this.currentPlayer || !this.game) return;
    // this.updateGamePlayer(this.currentPlayer);
  }

}
