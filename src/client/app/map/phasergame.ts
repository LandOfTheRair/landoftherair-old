
import { find, remove, compact, difference } from 'lodash';

import { ClientGameState } from '../clientgamestate';

import { environment } from '../../environments/environment';
import { Player } from '../../../models/player';
import { Sex, Direction } from '../../../models/character';
import { Item } from '../../../models/item';

export class Game {

  private player: Player;
  private playerSprite: any;
  private map: any;

  private itemsOnGround: any;

  private groups: any = {
    Decor: {},
    DenseDecor: {},
    OpaqueDecor: {},
    Interactables: {}
  };

  private visibleSprites = {};

  private otherPlayerSprites = [];

  public canCreate: Promise<any>;
  public canUpdate: Promise<any>;
  private resolveCanCreate;
  private resolveCanUpdate;

  public moveCallback = (x, y) => {};
  public interactCallback = (x, y) => {};

  constructor(private clientGameState: ClientGameState, player) {
    if(this.itemsOnGround) {
      this.itemsOnGround.destroy();
    }

    this.player = player;
    this.canCreate = new Promise(resolve => this.resolveCanCreate = resolve);
    this.canUpdate = new Promise(resolve => this.resolveCanUpdate = resolve);
  }

  async createPlayer(player: Player) {
    if(!this.g.add) return;
    await this.canCreate;

    const sprite = this.getPlayerSprite(player);
    if(player.username === this.player.username) {
      this.player = player;
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
    if(this.player.username === player.username && this.playerSprite) {
      this.playerSprite.destroy();
      delete this.playerSprite;

    } else {
      const sprite = find(this.otherPlayerSprites, { username: player.username });
      if(!sprite) return;
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

  getStartingSwimmingSpriteForSex(sex: Sex) {
    switch(sex) {
      case 'Male':    return 6;
      case 'Female':  return 0;
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

  getSwimmingSpriteOffsetForDirection(dir: Direction) {
    switch(dir) {
      case 'S': return 60;
      case 'W': return 84;
      case 'E': return 36;
      case 'N': return 12;
    }
  }

  getPlayerSprite(player: Player) {
    const spriteGender = this.getStartingSpriteForSex(player.sex);
    const spriteDir = this.getSpriteOffsetForDirection(player.dir);

    const sprite = this.g.add.sprite(player.x * 64, player.y * 64, 'Creatures', spriteGender+spriteDir);
    sprite.username = player.username;

    this.updatePlayerSprite(sprite, player);

    // input enabled on sprite

    return sprite;
  }

  updatePlayerSprite(sprite, player: Player) {

    let frame = 0;
    let key = '';

    // if player isn't swimming or player is dead
    if(!player.swimLevel || player.dir === 'C') {
      const spriteGender = this.getStartingSpriteForSex(player.sex);
      const spriteDir = this.getSpriteOffsetForDirection(player.dir);
      frame = spriteGender + spriteDir;
      key = 'Creatures';
    } else {
      const spriteGender = this.getStartingSwimmingSpriteForSex(player.sex);
      const spriteDir = this.getSwimmingSpriteOffsetForDirection(player.dir);
      frame = spriteGender + spriteDir;
      key = 'Swimming';
    }

    sprite.x = player.x * 64;
    sprite.y = player.y * 64;

    if(sprite.key !== key) {
      sprite.loadTexture(key, frame);
    }

    sprite.frame = frame;
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

      const possibleInteractable = find(this.map.objects.Interactables, { x: xCoord*64, y: (yCoord+1)*64 });

      if(possibleInteractable) {
        // check if it's within "interact" range
        if(Math.abs(xDiff) < 2 && Math.abs(yDiff) < 2) {
          this.interactCallback(xDiff, yDiff);
        }
      }

      if(xDiff === 0 && yDiff === 0) return;

      this.moveCallback(xDiff, yDiff);
    });
  }

  private showItemSprites(centerX, centerY) {
    const checkedUUIDs = [];

    for(let x = centerX-4; x <= centerX+4; x++) {

      const itemPatchX = this.clientGameState.groundItems[x];
      if(!itemPatchX) continue;

      for(let y = centerY-4; y <= centerY+4; y++) {
        const itemPatchY = this.clientGameState.groundItems[x][y];
        if(!itemPatchY) continue;

        Object.keys(itemPatchY).forEach(itemType => {
          if(itemPatchY[itemType].length === 0) return;
          const item = itemPatchY[itemType][0];
          if(!item) return;
          checkedUUIDs.push(item.uuid);
          this.createItemSprite(item, x, y);
        });
      }
    }

    const groundUUIDs = this.itemsOnGround.children.map(x => x.uuid);
    const diff = difference(groundUUIDs, checkedUUIDs);

    diff.forEach(uuid => {
      const sprite = find(this.itemsOnGround.children, { uuid });
      sprite.destroy();
    });
  }

  private createItemSprite(item: Item, x, y) {
    if(!this.visibleSprites[x]) this.visibleSprites[x] = {};
    if(!this.visibleSprites[x][y]) this.visibleSprites[x][y] = {};
    if(!this.visibleSprites[x][y][item.itemClass]) this.visibleSprites[x][y][item.itemClass] = null;

    const currentItemSprite = this.visibleSprites[x][y][item.itemClass];

    if(currentItemSprite) {
      if(currentItemSprite.uuid === item.uuid) {
        return;
      } else {
        currentItemSprite.destroy();
      }
    }

    const sprite = this.g.add.sprite(x * 64, y * 64, 'Items', item.sprite);
    this.visibleSprites[x][y][item.itemClass] = sprite;
    sprite.itemClass = item.itemClass;
    sprite.uuid = item.uuid;
    this.itemsOnGround.add(sprite);
  }

  private removeOldItemSprites(centerX, centerY) {
    this.itemsOnGround.children.forEach(sprite => {
      const x = sprite.x / 64;
      const y = sprite.y / 64;

      if(x < centerX - 4 || x > centerX + 4 || y < centerY - 4 || y > centerY + 4) {
        this.visibleSprites[x][y][sprite.itemClass] = null;
        this.itemsOnGround.removeChild(sprite);
        sprite.destroy();
      }
    });
  }

  preload() {
    this.g.load.image('Terrain', `${this.assetUrl}/terrain.png`, 64, 64);
    this.g.load.spritesheet('Walls', `${this.assetUrl}/walls.png`, 64, 64);
    this.g.load.spritesheet('Decor', `${this.assetUrl}/decor.png`, 64, 64);

    this.g.load.spritesheet('Creatures', `${this.assetUrl}/creatures.png`, 64, 64);
    this.g.load.spritesheet('Swimming', `${this.assetUrl}/swimming.png`, 64, 64);

    this.g.load.spritesheet('Items', `${this.assetUrl}/items.png`, 64, 64);
    this.g.load.tilemap(this.clientGameState.mapName, null, this.clientGameState.map, (<any>window).Phaser.Tilemap.TILED_JSON);
  }

  create() {
    this.map = this.g.add.tilemap(this.clientGameState.mapName);

    this.map.addTilesetImage('Terrain', 'Terrain');
    this.map.addTilesetImage('Walls', 'Walls');
    this.map.addTilesetImage('Decor', 'Decor');

    this.map.createLayer('Terrain').resizeWorld();

    this.map.createLayer('Fluids');
    this.map.createLayer('Floors');
    this.map.createLayer('Walls');
    this.map.createLayer('Foliage');

    const doneGids = {};

    const decorFirstGid = this.map.tilesets[2].firstgid;
    const wallFirstGid = this.map.tilesets[1].firstgid;

    const parseLayer = (layer, obj) => {
      if(doneGids[obj.gid]) return;
      doneGids[obj.gid] = 1;

      const isWall = obj.gid < decorFirstGid;
      const firstGid = isWall ? wallFirstGid : decorFirstGid;
      const tileSet = isWall ? 'Walls' : 'Decor';
      this.map.createFromObjects(layer, obj.gid, tileSet, obj.gid - firstGid, true, false, this.groups[layer]);
    };

    ['Decor', 'DenseDecor', 'OpaqueDecor', 'Interactables'].forEach(layer => {
      this.groups[layer] = this.g.add.group();
      this.map.objects[layer].forEach(parseLayer.bind(this, layer));
    });

    this.resolveCanCreate();

    this.itemsOnGround = this.g.add.group();

    this.setupPhaser();
  }

  update() {
    if(!this.player) return;

    // center on player mid
    this.g.camera.focusOnXY((this.player.x * 64) + 32, (this.player.y * 64) + 32);

    if(this.clientGameState.updates.openDoors.length > 0) {
      this.clientGameState.updates.openDoors.forEach((doorId, i) => {
        const door = this.clientGameState.mapData.openDoors[doorId];
        if(!door) return;

        const doorSprite = find(this.groups.Interactables.children, { x: door.x, y: door.y });
        if(door.isOpen) doorSprite.frame += 1;
        else            doorSprite.frame -= 1;

        this.clientGameState.updates.openDoors[i] = null;
      });

      this.clientGameState.updates.openDoors = compact(this.clientGameState.updates.openDoors);
    }

    this.removeOldItemSprites(this.player.x, this.player.y);
    this.showItemSprites(this.player.x, this.player.y);
  }

  destroy() {
    if(this.playerSprite) {
      this.playerSprite.destroy();
    }
    this.otherPlayerSprites.forEach(sprite => sprite.destroy());
    this.itemsOnGround.destroy();
  }
}
