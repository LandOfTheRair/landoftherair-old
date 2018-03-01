import { Component, OnInit, ViewChild, OnDestroy, NgZone } from '@angular/core';

import { Game } from './phasergame';
import { Player } from '../../../shared/models/player';
import { ColyseusService } from '../colyseus.service';

import { HPBox, XPBox } from './floating-box';
import { AssetService } from '../asset.service';

import { get } from 'lodash';
import { MapLayer } from '../../../shared/models/maplayer';

enum TilesWithNoFOVUpdate {
  Empty = 0,
  Air = 2386
}

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

  private get map(): any {
    return this.clientGameState.map;
  }

  constructor(private assetService: AssetService, public colyseus: ColyseusService, public zone: NgZone) {}

  private cleanCanvases() {
    const elements = document.getElementsByTagName('canvas');
    while(elements[0]) elements[0].parentNode.removeChild(elements[0]);
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.initGame();
    });
  }

  private initGame() {

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

      this.game = new Game(this.clientGameState, this.assetService, this.colyseus);

      const config = {
        width: boxSize, height: boxSize,
        multiTexture: true, renderer: (<any>window).Phaser.AUTO,
        state: this.game, parent: 'mapcanvas',
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

    this.game.reset();
    this.phaser.destroy();

    this.cleanCanvases();
  }

  isThereAWallAt(checkX: number, checkY: number) {
    const map = this.map;
    const { width, layers } = map;
    const { x, y } = this.currentPlayer;

    const totalX = x + checkX;
    const totalY = y + checkY;

    const hasSecretWall = get(this.clientGameState.secretWallHash, [totalX, totalY]);

    const wallLayerTile = layers[MapLayer.Walls].data[(width * totalY) + totalX];

    return hasSecretWall || (wallLayerTile !== TilesWithNoFOVUpdate.Empty && wallLayerTile !== TilesWithNoFOVUpdate.Air);
  }

  shouldRenderXY(x: number, y: number) {

    const val = get(this.colyseus.game.clientGameState.fov, [x, y]);

    // if(isUndefined(val)) return fal;

    return this.game
        && this.game.shouldRender
        && val;
  }

  canDarkSee(x: number, y: number) {
    return this.clientGameState.darkness['x' + (x + this.currentPlayer.x)]
        && this.clientGameState.darkness['x' + (x + this.currentPlayer.x)]['y' + (y + this.currentPlayer.y)]
        && this.currentPlayer.hasEffect('DarkVision');
  }

}
