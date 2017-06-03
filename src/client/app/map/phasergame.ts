
import { find, remove } from 'lodash';

import { ClientGameState } from '../../../models/clientgamestate';

import { environment } from '../../environments/environment';
import { Player, Sex, Direction } from '../../../models/player';

export class Game {

  private player: Player;
  private playerSprite: any;

  private otherPlayerSprites = [];

  public canCreate: Promise<any>;
  public canUpdate: Promise<any>;
  private resolveCanCreate;
  private resolveCanUpdate;

  public moveCallback = (x, y) => {};

  constructor(private clientGameState: ClientGameState, player) {
    this.player = player;
    this.canCreate = new Promise(resolve => this.resolveCanCreate = resolve);
    this.canUpdate = new Promise(resolve => this.resolveCanUpdate = resolve);
  }

  async createPlayer(player: Player) {
    if(!this.g.add) return;
    await this.canCreate;

    const sprite = this.getPlayerSprite(player);
    if(player.username === this.player.username) {
      this.playerSprite = sprite;
      this.resolveCanUpdate(sprite);

    } else {
      this.otherPlayerSprites.push(sprite);
    }
  }

  async updatePlayer(player: Player) {
    await this.canCreate;

    if(this.player.username === player.username) {
      this.player = player;
      this.updatePlayerSprite(this.playerSprite, player);

    } else {
      let sprite = find(this.otherPlayerSprites, { username: player.username });
      if(!sprite) {
        this.createPlayer(player);
      } else {
        this.updatePlayerSprite(sprite, player);
      }
    }
  }

  removePlayer(player: Player) {
    if(this.player.username === player.username) {
      this.playerSprite.destroy();
      delete this.playerSprite;

    } else {
      const sprite = find(this.otherPlayerSprites, { username: player.username });
      sprite.destroy();
      remove(this.otherPlayerSprites, sprite => sprite.username === player.username);
    }
  }

  get assetUrl() {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets`;
  }

  get g(): any {
    return <any>this;
  }

  getStartingSpriteForSex(sex: Sex) {
    switch(sex) {
      case 'Male':    return 725;
      case 'Female':  return 675;
    }
  }

  getSpriteOffsetForDirection(dir: Direction) {
    switch(dir) {
      case 'S': return 0;
      case 'W': return 1;
      case 'E': return 2;
      case 'N': return 3;
      case 'C': return 4;
    }
  }

  getPlayerSprite(player: Player) {
    const spriteGender = this.getStartingSpriteForSex(player.sex);
    const spriteDir = this.getSpriteOffsetForDirection(player.dir);

    const sprite = this.g.add.sprite(player.x * 64, player.y * 64, 'Creatures', spriteGender+spriteDir);
    sprite.username = player.username;

    // input enabled on sprite

    return sprite;
  }

  updatePlayerSprite(sprite, player: Player) {
    const spriteGender = this.getStartingSpriteForSex(player.sex);
    const spriteDir = this.getSpriteOffsetForDirection(player.dir);

    sprite.x = player.x * 64;
    sprite.y = player.y * 64;

    sprite.frame = spriteGender + spriteDir;
  }

  private setupPhaser() {
    this.g.stage.disableVisibilityChange = true;
    this.g.inputEnabled = true;
    this.g.input.onDown.add(({ worldX, worldY }) => {

      const xCoord = Math.floor(worldX / 64);
      const yCoord = Math.floor(worldY / 64);

      const xPlayer = this.player.x;
      const yPlayer = this.player.y;

      // adjust X/Y so they're relative to the player
      const xDiff = xCoord - xPlayer;
      const yDiff = yCoord - yPlayer;

      if(xDiff === 0 && yDiff === 0) return;

      this.moveCallback(xDiff, yDiff);
    });
  }

  preload() {
    this.g.load.image('Terrain', `${this.assetUrl}/terrain.png`, 64, 64);
    this.g.load.spritesheet('Walls', `${this.assetUrl}/walls.png`, 64, 64);
    this.g.load.spritesheet('Decor', `${this.assetUrl}/decor.png`, 64, 64);

    this.g.load.spritesheet('Creatures', `${this.assetUrl}/creatures.png`, 64, 64);
    this.g.load.tilemap(this.clientGameState.mapName, null, this.clientGameState.map, (<any>window).Phaser.Tilemap.TILED_JSON);
  }

  create() {
    const map = this.g.add.tilemap(this.clientGameState.mapName);

    map.addTilesetImage('Terrain', 'Terrain');
    map.addTilesetImage('Walls', 'Walls');
    map.addTilesetImage('Decor', 'Decor');

    map.createLayer('Terrain').resizeWorld();

    map.createLayer('Fluids');
    map.createLayer('Floors');
    map.createLayer('Walls');
    map.createLayer('Foliage');

    const doneGids = {};

    const decorFirstGid = map.tilesets[1].firstgid;
    const wallFirstGid = map.tilesets[2].firstgid;

    const parseLayer = (layer, obj) => {
      if(doneGids[obj.gid]) return;
      doneGids[obj.gid] = 1;

      const isWall = obj.gid > wallFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';
      map.createFromObjects(layer, obj.gid, tileSet, obj.gid - firstGid);
    };

    map.objects.Decor.forEach(parseLayer.bind(this, 'Decor'));
    map.objects.DenseDecor.forEach(parseLayer.bind(this, 'DenseDecor'));
    map.objects.Interactables.forEach(parseLayer.bind(this, 'Interactables'));

    this.resolveCanCreate();

    this.setupPhaser();
  }

  render() {

  }

  update() {
    if(!this.player) return;
    this.g.camera.focusOnXY((this.player.x * 64) + 32, (this.player.y * 64) + 32);
  }

  destroy() {
    if(this.playerSprite) {
      this.playerSprite.destroy();
    }
    this.otherPlayerSprites.forEach(sprite => sprite.destroy());
  }
}
