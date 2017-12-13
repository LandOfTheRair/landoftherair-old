import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { Game } from './phasergame';
import { Player } from '../../../shared/models/player';
import { ColyseusService } from '../colyseus.service';

import { HPBox, XPBox } from './floating-box';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild('mapElement')
  public mapContainer;

  private phaser: any;
  private game: Game;

  start$: any;

  create$: any;
  update$: any;
  remove$: any;
  boxes$:  any;

  started: boolean;

  private get clientGameState() {
    return this.colyseus.game.clientGameState;
  }

  private get currentPlayer(): Player {
    return this.clientGameState.currentPlayer;
  }

  constructor(public colyseus: ColyseusService) {}

  private cleanCanvases() {
    const elements = document.getElementsByTagName('canvas');
    while(elements[0]) elements[0].parentNode.removeChild(elements[0]);
  }

  ngOnInit() {

    const allBoxes = [];

    this.start$ = this.clientGameState.setMap$.subscribe((map: any) => {

      if(this.started && this.phaser) {
        allBoxes.forEach(box => box.clearSelf());
        this.game.reset();
        this.phaser.state.start(this.phaser.state.current);
      }

      if(!map || !map.layers || this.started) return;

      this.started = true;
      this.cleanCanvases();

      // 9x9, tiles are 64x64
      const boxSize = 9 * 64;

      this.game = new Game(this.clientGameState, this.colyseus);

      const config = {
        width: boxSize, height: boxSize,
        multiTexture: true, renderer: (<any>window).Phaser.AUTO,
        state: this.game, parent: 'map',
        enableDebug: false
      };

      this.phaser = new (<any>window).Phaser.Game(config);

      this.create$ = this.clientGameState.createPlayer$.subscribe((addPlayer) => {

        this.clientGameState.players.forEach(player => {
          this.game.createPlayerShell(player);
        });

      });

      this.update$ = this.clientGameState.updatePlayer$.subscribe((player) => {
        if(!this.game.isLoaded) return;

        this.game.updatePlayer(player);
      });

      this.remove$ = this.clientGameState.removePlayer$.subscribe((player) => {
        this.game.removePlayer(player);
      });

      this.boxes$ = this.clientGameState.playerBoxes$.subscribe(({ newPlayer, oldPlayer }) => {
        if(!this.game.isLoaded || !newPlayer || !oldPlayer) return;

        const hpDifference = newPlayer.hp.__current - oldPlayer.hp.__current;
        const xpDifference = newPlayer.exp - oldPlayer.exp;

        if(hpDifference !== 0) {
          const box = new HPBox(hpDifference);
          box.init(this.mapContainer.nativeElement);
          allBoxes.push(box);
        }

        if(xpDifference !== 0) {
          const box = new XPBox(xpDifference);
          box.init(this.mapContainer.nativeElement);
          allBoxes.push(box);
        }
      });
    });
  }

  ngOnDestroy() {
    this.start$.unsubscribe();

    if(this.create$) this.create$.unsubscribe();
    if(this.update$) this.update$.unsubscribe();
    if(this.remove$) this.remove$.unsubscribe();
    if(this.boxes$)  this.boxes$.unsubscribe();

    this.game.destroy();
    this.phaser.destroy();

    this.cleanCanvases();
  }

  shouldRenderXY(x: number, y: number) {
    return this.game
        && this.game.shouldRender
        && this.colyseus.game.clientGameState.fov[x]
        && this.colyseus.game.clientGameState.fov[x][y];
  }

  canDarkSee(x: number, y: number) {
    return this.clientGameState.darkness['x' + (x + this.currentPlayer.x)]
        && this.clientGameState.darkness['x' + (x + this.currentPlayer.x)]['y' + (y + this.currentPlayer.y)]
        && this.currentPlayer.hasEffect('DarkVision');
  }

}
