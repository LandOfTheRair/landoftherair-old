import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ClientGameState } from '../../../models/clientgamestate';

import { Game } from './phasergame';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  @Input()
  public clientGameState: ClientGameState = new ClientGameState({});

  private phaser: any;
  private game: Game;

  constructor() { }

  ngOnInit() {
    // 9x9, tiles are 64x64
    const boxSize = 9 * 64;

    this.game = new Game(this.clientGameState);
    this.phaser = new (<any>window).Phaser.Game(boxSize, boxSize, (<any>window).Phaser.CANVAS, 'map', this.game);
  }

  ngOnDestroy() {
    if(this.phaser) {
      this.phaser.destroy();
    }

    const elements = document.getElementsByTagName('canvas');
    while(elements[0]) elements[0].parentNode.removeChild(elements[0]);
  }

}
