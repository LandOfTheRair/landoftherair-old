
import * as TiledPlugin from 'phaser-tiled';

import { find, remove, compact, difference, values } from 'lodash';

import { ClientGameState } from '../clientgamestate';

import { environment } from '../../environments/environment';
import { Player } from '../../../models/player';
import { Sex, Direction, Allegiance } from '../../../models/character';
import { Item } from '../../../models/item';
import { TrueSightMap, TrueSightMapReversed } from './phaserconversionmaps';
import { MapLayer } from '../../../models/maplayer';

const cacheKey = TiledPlugin.utils.cacheKey;

const SFXMap = {
  'combat self block armor': 'combat-block-armor',
  'combat self block weapon': 'combat-block-weapon',
  'combat self miss': 'combat-miss',
  'combat other kill': 'combat-die',
  'combat self kill': 'combat-kill',
  'combat self hit magic': 'combat-hit-spell',
  'combat self hit melee': 'combat-hit-melee',
  'spell buff give': 'spell-buff',
  'spell buff get': 'spell-buff'
};

const bgms = ['combat', 'town', 'dungeon', 'wilderness'];
const sfxs = values(SFXMap);

export class Game {

  private playerSprite: any;
  private map: any;

  private visibleNPCUUIDHash = {};
  private visibleItemUUIDHash = {};
  private visibleSprites = {};
  private playerSpriteHash = {};

  // groups
  private itemsOnGround: any;
  private visibleNPCs: any;
  private otherPlayerSprites: any;
  private vfx: any;

  private isRenderingTruesight: boolean;

  private groups: any = {
    Decor: {},
    DenseDecor: {},
    OpaqueDecor: {},
    Interactables: {}
  };

  // lots of stuff needed for init
  public canCreate: Promise<any>;
  public canUpdate: Promise<any>;
  private resolveCanCreate;
  private resolveCanUpdate;

  private blockUpdates: boolean;

  private currentBgm: string;
  private bgms = {};
  private sfxs = {};

  public isLoaded: boolean;

  private frames = 0;

  public get shouldRender() {
    if(!this.g || !this.g.camera || !this.playerSprite) return false;

    const point = this.g.camera.position;
    return point.x !== 0 && point.y !== 0 && this.frames >= 20;
  }

  constructor(private clientGameState: ClientGameState, public colyseus, private player: Player) {
    this.initPromises();

    // reset any time inGame is set to true
    this.colyseus.game.inGame$.subscribe(inGame => {
      if(!inGame) {
        this.updateBgm('');
        return;
      }

      this.reset();
    });

    this.colyseus.game.bgm$.subscribe(nextBgm => {
      this.updateBgm(nextBgm);
    });

    this.colyseus.game.sfx$.subscribe(nextSfx => {
      this.playSfx(nextSfx);
    });

    this.colyseus.game.vfx$.subscribe(nextVfx => {
      this.drawVfx(nextVfx);
    });
  }

  private drawVfx({ effect, tiles }) {
    tiles.forEach(({ x, y }) => {
      const sprite = this.g.add.sprite(x * 64, y * 64, 'Effects', effect);
      this.vfx.add(sprite);

      setTimeout(() => {
        sprite.destroy();
      }, 2000);
    });
  }

  private playSfx(sfx: string) {
    const convertSfx = SFXMap[sfx];

    if(!this.sfxs[convertSfx] || !this.sfxs[convertSfx].isDecoded) return;

    this.sfxs[convertSfx].play();
  }

  private updateBgm(newBgm: string) {
    if(!newBgm && this.currentBgm) {
      this.bgms[this.currentBgm].stop();
      this.currentBgm = '';
      return;
    }

    if(newBgm === this.currentBgm) return;

    if(this.currentBgm) {
      this.bgms[this.currentBgm].stop();
    }

    if(this.bgms[newBgm] && this.bgms[newBgm].isDecoded) {
      this.currentBgm = newBgm;
      this.bgms[this.currentBgm].loopFull();
    }

  }

  public reset() {
    this.updateBgm('');
    this.blockUpdates = true;

    if(this.itemsOnGround) {
      this.itemsOnGround.destroy();
    }

    if(this.visibleNPCs) {
      this.visibleNPCs.destroy();
    }

    if(this.otherPlayerSprites) {
      this.otherPlayerSprites.destroy();
    }

    if(this.vfx) {
      this.vfx.destroy();
    }

    this.visibleNPCUUIDHash = {};
    this.visibleItemUUIDHash = {};
    this.visibleSprites = {};
    this.playerSpriteHash = {};

    this.frames = 0;
  }

  initPromises() {
    this.canCreate = new Promise(resolve => this.resolveCanCreate = resolve);
    this.canUpdate = new Promise(resolve => this.resolveCanUpdate = resolve);
  }

  async createPlayer(player: Player) {
    if(!this.g.add) return;
    await this.canCreate;

    if(player.username === this.player.username) {
      if(this.playerSprite) return;

      // duplicated code so we don't dupe the sprite
      const sprite = this.getPlayerSprite(player);
      this.player = player;
      this.playerSprite = sprite;
      this.truesightCheck();
      this.resolveCanUpdate(sprite);
      this.isLoaded = true;

    } else {
      if(this.playerSpriteHash[player.username]) return;
      const sprite = this.getPlayerSprite(player);
      this.playerSpriteHash[player.username] = sprite;
      this.otherPlayerSprites.add(sprite);
    }
  }

  async updatePlayer(player: Player) {
    await this.canUpdate;

    if(this.player.username === player.username) {
      this.player = player;
      this.truesightCheck();
      this.updatePlayerSprite(this.playerSprite, player);
    } else {
      const sprite = this.playerSpriteHash[player.username];
      if(!sprite) return;
      this.updatePlayerSprite(sprite, player);
    }
  }

  removePlayer(player: Player) {
    if(this.player.username === player.username && this.playerSprite) {
      this.playerSprite.destroy();
      delete this.playerSprite;

    } else {
      if(!this.otherPlayerSprites) return;
      const oldSprite = this.playerSpriteHash[player.username];
      if(!oldSprite) return;
      oldSprite.destroy();
      delete this.playerSpriteHash[player.username];
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

      case 'Wilderness':    { choices = { Male: 730, Female: 680 }; break; }
      case 'Royalty':       { choices = { Male: 735, Female: 685 }; break; }
      case 'Adventurers':   { choices = { Male: 740, Female: 690 }; break; }
      case 'Underground':   { choices = { Male: 745, Female: 695 }; break; }
      case 'Pirates':       { choices = { Male: 750, Female: 700 }; break; }
    }

    return choices[sex];
  }

  getStartingSwimmingSpriteForSex(allegiance: Allegiance, sex: Sex) {

    let choices: any = { Male: 6, Female: 0 };

    switch(allegiance) {
      case 'None':          { choices = { Male: 6,  Female: 0 }; break; }
      case 'Townsfolk':     { choices = { Male: 6,  Female: 0 }; break; }

      case 'Wilderness':    { choices = { Male: 7,  Female: 1 }; break; }
      case 'Royalty':       { choices = { Male: 8,  Female: 2 }; break; }
      case 'Adventurers':   { choices = { Male: 9,  Female: 3 }; break; }
      case 'Underground':   { choices = { Male: 10, Female: 4 }; break; }
      case 'Pirates':       { choices = { Male: 11, Female: 5 }; break; }
    }

    return choices[sex];
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
      const spriteGender = this.getStartingSwimmingSpriteForSex(player.allegiance, player.sex);
      const spriteDir = this.getSwimmingSpriteOffsetForDirection(player.dir);
      frame = spriteGender + spriteDir;
      key = 'Swimming';
    }

    sprite.x = player.x * 64;
    sprite.y = player.y * 64;

    if(sprite.key !== key) {
      sprite.loadTexture(key, frame);
    }

    if(frame) {
      sprite.frame = frame;
    }

    if(player.username !== this.player.username) {
      sprite.visible = this.player.canSeeThroughStealthOf(player);
    }
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
          this.colyseus.game.doInteract(xDiff, yDiff);
        }
      }

      if(xDiff === 0 && yDiff === 0) return;

      this.colyseus.game.doMove(xDiff, yDiff);
    });

    this.g.game.canvas.oncontextmenu = (e) => {
      e.preventDefault();
      return false;
    };
  }

  private canCreateItemSpriteAt(x, y) {
    const tileCheck = (y * this.clientGameState.map.width) + x;
    const fluid = this.clientGameState.map.layers[MapLayer.Fluids].data;
    const foliage = this.clientGameState.map.layers[MapLayer.Foliage].data;
    return !fluid[tileCheck] && !foliage[tileCheck];
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

          if(!this.canCreateItemSpriteAt(x, y)) return;
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

      let ground = this.clientGameState.groundItems[x] ? this.clientGameState.groundItems[x][y] : null;
      ground = ground || {};

      const myGround = ground[sprite.itemClass];
      if(this.notInRange(centerX, centerY, x, y) || !myGround || !myGround[0] || myGround[0].uuid !== sprite.uuid) {
        delete this.visibleItemUUIDHash[sprite.uuid];
        this.visibleSprites[x][y][sprite.itemClass] = null;
        this.itemsOnGround.removeChild(sprite);
        sprite.destroy();
      }
    });
  }

  public cacheMap(mapData) {
    if(!mapData) return;
    this.g.load.tiledmap(cacheKey(this.clientGameState.mapName, 'tiledmap'), null, mapData, (<any>window).Phaser.Tilemap.TILED_JSON);
  }

  public updateDoors() {
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

  public setupLoadingListeners() {

    const textStyle = {
      fill: '#fff',
      font: '32px Fantasy',
      align: 'center'
    };

    const loadingText = this.g.add.text(this.g.world.centerX, this.g.world.centerY, 'Loading...', textStyle);
    loadingText.anchor.set(0.5, 0);

    loadingText.bringToTop();

    this.g.load.onLoadStart.add(() => {
      loadingText.setText('Loading...');
    });

    this.g.load.onFileComplete.add((progress, cacheKeyForLoaded, success, totalLoaded, totalFiles) => {
      loadingText.setText(`Loading... ${progress}% complete (${totalLoaded}/${totalFiles})`);
    });

    this.g.load.onLoadComplete.add(() => {
      loadingText.destroy();
    });
  }

  private createLayers() {
    ['Decor', 'DenseDecor', 'OpaqueDecor', 'Interactables'].forEach((layer) => {
      this.groups[layer] = this.g.add.group();
    });

    this.itemsOnGround = this.g.add.group();
    this.vfx = this.g.add.group();
    this.visibleNPCs = this.g.add.group();
    this.otherPlayerSprites = this.g.add.group();
  }

  preload() {
    this.setupPhaser();

    this.isLoaded = false;

    this.g.add.plugin(new TiledPlugin(this.g, this.g.stage));

    const loadMap = this.clientGameState.map;

    // remove unused tileset to prevent warnings since things on a layer that uses this tileset are handled manually
    loadMap.tilesets.length = 3;

    this.cacheMap(loadMap);

    this.g.load.tiledmap(cacheKey(this.clientGameState.mapName, 'tiledmap'), null, loadMap, (<any>window).Phaser.Tilemap.TILED_JSON);

    this.g.load.image(cacheKey(this.clientGameState.mapName, 'tileset', 'Terrain'), `${this.assetUrl}/terrain.png`, 64, 64);
    this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Walls'), `${this.assetUrl}/walls.png`, 64, 64);
    this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Decor'), `${this.assetUrl}/decor.png`, 64, 64);

    this.g.load.spritesheet('Swimming', `${this.assetUrl}/swimming.png`, 64, 64);
    this.g.load.spritesheet('Creatures', `${this.assetUrl}/creatures.png`, 64, 64);
    this.g.load.spritesheet('Items', `${this.assetUrl}/items.png`, 64, 64);
    this.g.load.spritesheet('Effects', `${this.assetUrl}/effects.png`, 64, 64);

    bgms.forEach(bgm => {
      this.g.load.audio(`bgm-${bgm}`, `${this.assetUrl}/bgm/${bgm}.mp3`);
    });

    sfxs.forEach(sfx => {
      this.g.load.audio(`sfx-${sfx}`, `${this.assetUrl}/sfx/${sfx}.mp3`);
    });

    this.g.game.renderer.setTexturePriority(['Terrain', 'Walls', 'Decor', 'Creatures', 'Items']);

    this.setupLoadingListeners();
  }

  create() {
    bgms.forEach(bgm => {
      this.bgms[bgm] = this.g.add.audio(`bgm-${bgm}`);
    });

    sfxs.forEach(sfx => {
      this.sfxs[sfx] = this.g.add.audio(`sfx-${sfx}`);
    });

    this.blockUpdates = false;

    this.map = this.g.add.tiledmap(this.clientGameState.mapName);

    this.createLayers();
    this.resolveCanCreate();

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
      parseLayer(this.map.objects[index]);
    });
  }

  update() {
    if(!this.player || !this.colyseus.game._inGame || this.blockUpdates) return;

    // center on player mid
    this.g.camera.focusOnXY((this.player.x * 64) + 32, (this.player.y * 64) + 32);

    if(this.frames < 20) {
      this.frames++;
    }

    if(this.clientGameState.updates.openDoors.length > 0) {
      this.updateDoors();
    }

    this.removeOldItemSprites(this.player.x, this.player.y);
    this.showItemSprites(this.player.x, this.player.y);

    this.showNPCSprites(this.player.x, this.player.y);
  }

  destroy() {
    this.reset();
  }
}
