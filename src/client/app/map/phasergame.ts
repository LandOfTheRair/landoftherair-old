
import { ClientGameState } from '../../../models/clientgamestate';

import { environment } from '../../environments/environment';

export class Game {

  constructor(private clientGameState: ClientGameState) {}

  get mapUrl() {
    return `${environment.server.protocol}://${environment.server.domain}:${environment.server.port}/maps`;
  }

  get assetUrl() {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets`;
  }

  get g(): any {
    return <any>this;
  }

  preload() {
    this.g.load.image('Terrain', `${this.assetUrl}/terrain.png`, 64, 64);
    this.g.load.image('Walls', `${this.assetUrl}/walls.png`, 64, 64);
    this.g.load.image('Decor', `${this.assetUrl}/decor.png`, 64, 64);

    // this.g.load.spritesheet('creatures', `${this.assetUrl}/creatures.png`, 64, 64);
    this.g.load.tilemap(this.clientGameState.mapName, null, this.clientGameState.map, (<any>window).Phaser.Tilemap.TILED_JSON);
  }

  create() {
    console.log(this.clientGameState.map);
    const map = this.g.add.tilemap(this.clientGameState.mapName);

    map.addTilesetImage('Terrain', 'Terrain');
    map.addTilesetImage('Walls', 'Walls');
    map.addTilesetImage('Decor', 'Decor');

    const terrain = map.createLayer('Terrain');
    console.log(terrain);
    terrain.resizeWorld();

    map.createLayer('Liquid');
    map.createLayer('Floors');
    map.createLayer('Walls');
    map.createLayer('Foliage');
  }

  render() {

  }

  update() {

  }
}
