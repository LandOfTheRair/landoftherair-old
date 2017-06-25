
import * as TiledPlugin from 'phaser-tiled';

import { find, remove, compact, difference } from 'lodash';

import { ClientGameState } from '../clientgamestate';

import { environment } from '../../environments/environment';
import { Player } from '../../../models/player';
import { Sex, Direction, Allegiance } from '../../../models/character';
import { Item } from '../../../models/item';
import { TrueSightMap, TrueSightMapReversed } from './phaserconversionmaps';

const cacheKey = TiledPlugin.utils.cacheKey;

export class Game {

  private player: Player;
  private playerSprite: any;
  private map: any;

  private visibleNPCUUIDHash = {};
  private visibleItemUUIDHash = {};

  private itemsOnGround: any;
  private visibleNPCs: any;

  private isRenderingTruesight: boolean;

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
    if(this.visibleNPCs) {
      this.visibleNPCs.destroy();
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
      this.truesightCheck();
      this.resolveCanUpdate(sprite);

    } else {
      this.otherPlayerSprites.push(sprite);
    }
  }

  async updatePlayer(player: Player) {
    await this.canCreate;

    if(this.player.username === player.username) {
      this.player = player;
      this.truesightCheck();
      this.updatePlayerSprite(this.playerSprite, player);

    } else {
      const sprite = find(this.otherPlayerSprites, { username: player.username });
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
      const oldSprite = find(this.otherPlayerSprites, { username: player.username });
      if(!oldSprite) return;
      oldSprite.destroy();
      remove(this.otherPlayerSprites, sprite => sprite.username === player.username);
    }
  }

  get assetUrl() {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets`;
  }

  get g(): any {
    return <any>this;
  }

  getStartingSpriteForSex(allegiance: Allegiance, sex: Sex) {

    let choices: any = { Male: 725, Female: 675 };

    switch(allegiance) {
      case 'None':          { choices = { Male: 725, Female: 675 }; break; }
      case 'Townsfolk':     { choices = { Male: 725, Female: 675 }; break; }

      case 'Pirates':       { choices = { Male: 750, Female: 695 }; break; }
      case 'Wilderness':    { choices = { Male: 730, Female: 680 }; break; }
      case 'Adventurers':   { choices = { Male: 725, Female: 675 }; break; }
      case 'Royalty':       { choices = { Male: 735, Female: 685 }; break; }
      case 'Underground':   { choices = { Male: 745, Female: 690 }; break; }
    }

    return choices[sex];
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
    const spriteGender = this.getStartingSpriteForSex(player.allegiance, player.sex);
    const spriteDir = this.getSpriteOffsetForDirection(player.dir);

    const sprite = this.g.add.sprite(player.x * 64, player.y * 64, 'Creatures', spriteGender + spriteDir);
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
      const spriteGender = this.getStartingSpriteForSex(player.allegiance, player.sex);
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

  private toggleTruesightForWalls(set: boolean) {
    this.groups.OpaqueDecor.children.forEach(sprite => {
      if(set && TrueSightMap[sprite.frame]) {
        sprite.loadTexture(cacheKey(this.clientGameState.mapName, 'tileset', 'Decor'), +TrueSightMap[sprite.frame]);
      } else if(!set && TrueSightMapReversed[sprite.frame]) {
        sprite.loadTexture(cacheKey(this.clientGameState.mapName, 'tileset', 'Walls'), +TrueSightMapReversed[sprite.frame]);
      }
    });
  }

  private truesightCheck() {
    if(this.isRenderingTruesight && !this.player.hasEffect('TrueSight')) {
      this.isRenderingTruesight = false;
      this.toggleTruesightForWalls(false);

    } else if(!this.isRenderingTruesight && this.player.hasEffect('TrueSight')) {
      this.isRenderingTruesight = true;
      this.toggleTruesightForWalls(true);

    }
  }

  private notInRange(centerX, centerY, x, y) {
    return x < centerX - 4 || x > centerX + 4 || y < centerY - 4 || y > centerY + 4;
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

      // objects[3] is Interactables in this case
      const possibleInteractable = find(this.map.objects[3].objects, { x: xCoord * 64, y: (yCoord + 1) * 64 });

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
    for(let x = centerX - 4; x <= centerX + 4; x++) {

      const itemPatchX = this.clientGameState.groundItems[x];
      if(!itemPatchX) continue;

      for(let y = centerY - 4; y <= centerY + 4; y++) {
        const itemPatchY = this.clientGameState.groundItems[x][y];
        if(!itemPatchY) continue;

        Object.keys(itemPatchY).forEach(itemType => {
          if(itemPatchY[itemType].length === 0) return;
          const item = itemPatchY[itemType][0];
          this.createItemSprite(item, x, y);
        });
      }
    }
  }

  private showNPCSprites(centerX, centerY) {
    const removeUUIDs = [];

    this.clientGameState.mapNPCs.forEach(npc => {
      if(this.notInRange(centerX, centerY, npc.x, npc.y) || npc.dir === 'C') {
        removeUUIDs.push(npc.uuid);
        return;
      }

      const currentSprite = find(this.visibleNPCs.children, { uuid: npc.uuid });
      if(currentSprite) {
        currentSprite.x = npc.x * 64;
        currentSprite.y = npc.y * 64;
        currentSprite.frame = npc.sprite + this.getSpriteOffsetForDirection(npc.dir);
        return;
      }

      const sprite = this.g.add.sprite(npc.x * 64, npc.y * 64, 'Creatures', npc.sprite);
      sprite.uuid = npc.uuid;
      this.visibleNPCUUIDHash[npc.uuid] = sprite;
      this.visibleNPCs.add(sprite);
    });

    removeUUIDs.forEach(uuid => {
      const sprite = this.visibleNPCUUIDHash[uuid];
      if(!sprite) return;
      delete this.visibleNPCUUIDHash[uuid];
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

    const isCorpse = item.name === 'Corpse';
    const sprite = this.g.add.sprite(x * 64, y * 64, isCorpse ? 'Creatures' : 'Items', item.sprite);
    this.visibleSprites[x][y][item.itemClass] = sprite;
    sprite.itemClass = item.itemClass;
    sprite.uuid = item.uuid;
    this.visibleItemUUIDHash[sprite.uuid] = sprite;
    this.itemsOnGround.add(sprite);
  }

  private removeOldItemSprites(centerX, centerY) {
    this.itemsOnGround.children.forEach(sprite => {
      const x = sprite.x / 64;
      const y = sprite.y / 64;

      const ground = this.clientGameState.groundItems[x] ? this.clientGameState.groundItems[x][y] : {};
      const myGround = ground[sprite.itemClass];
      if(this.notInRange(centerX, centerY, x, y) || !myGround || !myGround[0] || myGround[0].uuid !== sprite.uuid) {
        delete this.visibleItemUUIDHash[sprite.uuid];
        this.visibleSprites[x][y][sprite.itemClass] = null;
        this.itemsOnGround.removeChild(sprite);
        sprite.destroy();
      }
    });
  }

  preload() {
    this.g.add.plugin(new TiledPlugin(this.g, this.g.stage));

    const loadMap = this.clientGameState.map;

    // remove unused tileset to prevent warnings since things on a layer that uses this tileset are handled manually
    loadMap.tilesets.length = 3;

    this.g.load.tiledmap(cacheKey(this.clientGameState.mapName, 'tiledmap'), null, loadMap, (<any>window).Phaser.Tilemap.TILED_JSON);

    this.g.load.image(cacheKey(this.clientGameState.mapName, 'tileset', 'Terrain'), `${this.assetUrl}/terrain.png`, 64, 64);
    this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Walls'), `${this.assetUrl}/walls.png`, 64, 64);
    this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Decor'), `${this.assetUrl}/decor.png`, 64, 64);

    this.g.load.spritesheet('Swimming', `${this.assetUrl}/swimming.png`, 64, 64);
    this.g.load.spritesheet('Creatures', `${this.assetUrl}/creatures.png`, 64, 64);
    this.g.load.spritesheet('Items', `${this.assetUrl}/items.png`, 64, 64);

    this.g.game.renderer.setTexturePriority(['Terrain', 'Walls', 'Decor', 'Creatures', 'Items']);
  }

  create() {
    this.map = this.g.add.tiledmap(this.clientGameState.mapName);

    const decorFirstGid = this.map.tilesets[2].firstgid;
    const wallFirstGid = this.map.tilesets[1].firstgid;

    const parseLayer = (layer) => {
      layer.objects.forEach(obj => {
        const isWall = obj.gid < decorFirstGid;
        const firstGid = isWall ? wallFirstGid : decorFirstGid;
        const tileSet = isWall ? 'Walls' : 'Decor';

        const sprite = this.g.add.sprite(obj.x, obj.y - 64, cacheKey(this.clientGameState.mapName, 'tileset', tileSet), obj.gid - firstGid);
        this.groups[layer.name].add(sprite);
      });
    };

    ['Decor', 'DenseDecor', 'OpaqueDecor', 'Interactables'].forEach((layer, index) => {
      this.groups[layer] = this.g.add.group();
      parseLayer(this.map.objects[index]);
    });

    this.resolveCanCreate();

    this.itemsOnGround = this.g.add.group();
    this.visibleNPCs = this.g.add.group();

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
        if(!doorSprite) return;

        if(door.isOpen) doorSprite.frame += 1;
        else            doorSprite.frame -= 1;

        this.clientGameState.updates.openDoors[i] = null;
      });

      this.clientGameState.updates.openDoors = compact(this.clientGameState.updates.openDoors);
    }

    this.removeOldItemSprites(this.player.x, this.player.y);
    this.showItemSprites(this.player.x, this.player.y);

    this.showNPCSprites(this.player.x, this.player.y);
  }

  destroy() {
    if(this.playerSprite) {
      this.playerSprite.destroy();
    }
    this.otherPlayerSprites.forEach(sprite => sprite.destroy());
    this.itemsOnGround.destroy();
  }
}
