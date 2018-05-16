
import * as TiledPlugin from 'phaser-tiled';

import { find, compact, difference, values, forEach } from 'lodash';

import { ClientGameState } from '../clientgamestate';

import { Player } from '../../../shared/models/player';
import { Sex, Direction, Allegiance } from '../../../shared/models/character';
import { Item } from '../../../shared/models/item';
import { TrueSightMap, TrueSightMapReversed, VerticalDoorGids } from './phaserconversionmaps';
import { MapLayer } from '../../../shared/models/maplayer';

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

const ENVIRONMENTAL_OBJECT_GID_HASH = {
  Trap: { gid: 334, image: 'Items' }
};

const HIDDEN_SPRITE_ALPHA = 0.7;

export class Game {

  private playerSprite: any;
  private map: any;

  private visibleNPCUUIDHash = {};
  private visibleItemUUIDHash = {};
  private visibleSprites = {};
  private playerSpriteHash = {};
  private environmentalObjectHash = {};

  // groups
  private itemsOnGround: any;
  private otherEnvironmentalObjects: any;
  private visibleNPCs: any;
  private otherPlayerSprites: any;
  private vfx: any;

  private isRenderingTruesight: boolean;
  private isRenderingEagleEye: boolean;

  private groups: any = {
    Decor: {},
    DenseDecor: {},
    OpaqueDecor: {},
    Interactables: {}
  };

  private playersNeedingCreation: Player[] = [];

  private currentBgm: string;
  private bgms = {};
  private sfxs = {};

  public isLoaded: boolean;
  private hasFlashed: boolean;

  public get shouldRender() {
    if(!this.g || !this.g.camera || !this.playerSprite) return false;

    const point = this.g.camera.position;
    return point.x !== 0 && point.y !== 0;
  }

  private get player() {
    return this.clientGameState.currentPlayer;
  }

  constructor(private clientGameState: ClientGameState, private assetService, public colyseus) {

    // reset any time inGame is set to true
    this.colyseus.game.inGame$.subscribe(inGame => {
      this.reset();

      if(!inGame) {
        this.updateBgm('');
        return;
      }
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

    this.colyseus.game.myLoc$.subscribe(() => {
      this.focusCameraOnPlayer();
    });
  }

  public isSamePlayer(username: string) {
    return username === this.player.username;
  }

  private drawVfx({ effect, tiles }) {
    if(!this.vfx) return;

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
    this.g.lockRender = true;
    this.hasFlashed = false;

    if(this.playerSprite) {
      this.playerSprite.destroy();
    }

    if(this.itemsOnGround) {
      this.itemsOnGround.destroy();
    }

    if(this.otherEnvironmentalObjects) {
      this.otherEnvironmentalObjects.destroy();
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
    this.environmentalObjectHash = {};

    Object.keys(this.bgms).forEach(bgm => {
      if(!this.bgms[bgm]) return;
      this.bgms[bgm].destroy();
    });

    Object.keys(this.sfxs).forEach(sfx => {
      if(!this.sfxs[sfx]) return;
      this.sfxs[sfx].destroy();
    });

    this.bgms = {};
    this.sfxs = {};

    this.isRenderingTruesight = false;
  }

  private focusCameraOnPlayer() {
    if(!this.g || !this.g.camera || !this.player) return;
    this.g.camera.focusOnXY((this.player.x * 64) + 32, (this.player.y * 64) + 32);
  }

  public createPlayerShell(player: Player) {
    this.playersNeedingCreation.push(player);
  }

  private createPlayer(player: Player) {
    if(!player) return;

    if(this.isSamePlayer(player.username)) {
      if(this.playerSprite) this.playerSprite.destroy();

      // duplicated code so we don't dupe the sprite
      const sprite = this.getPlayerSprite(player);
      this.playerSprite = sprite;

    } else {
      if(this.playerSpriteHash[player.username]) return;
      const sprite = this.getPlayerSprite(player);
      this.playerSpriteHash[player.username] = sprite;
      this.otherPlayerSprites.add(sprite);
    }
  }

  updatePlayer(player: Player) {
    if(this.isSamePlayer(player.username)) {
      if(!this.playerSprite) return;

      this.updatePlayerSprite(this.playerSprite, player);
      this.truesightCheck();
      this.eagleeyeCheck();
    } else {
      let sprite = this.playerSpriteHash[player.username];
      if(!sprite) {
        this.createPlayer(player);
        sprite = this.playerSpriteHash[player.username];
      }
      this.updatePlayerSprite(sprite, player);
    }
  }

  removePlayer(player: Player) {
    if(this.isSamePlayer(player.username)) {
      if(!this.playerSprite) return;
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

  get g(): any {
    return <any>this;
  }

  getStartingSpriteForSex(player: Player) {
    return player.getBaseSprite();
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
    const spriteGender = this.getStartingSpriteForSex(player);
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
    if(!player.swimLevel || (player.dir === 'C' && player.hp.__current === 0)) {
      const spriteGender = this.getStartingSpriteForSex(player);
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
      sprite.visible = player.dir !== 'C' && this.player.canSeeThroughStealthOf(player);
    }

    sprite.alpha = (<any>player).totalStats.stealth ? HIDDEN_SPRITE_ALPHA : 1;
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

  private eagleeyeCheck() {
    if(this.isRenderingEagleEye && !this.player.hasEffect('EagleEye')) {
      this.isRenderingEagleEye = false;

    } else if(!this.isRenderingEagleEye && this.player.hasEffect('EagleEye')) {
      this.isRenderingEagleEye = true;

    }
  }

  private notInRange(centerX, centerY, x, y) {
    return x < centerX - 4 || x > centerX + 4 || y < centerY - 4 || y > centerY + 4;
  }

  private setupPhaser() {
    this.g.stage.disableVisibilityChange = true;

    this.g.inputEnabled = true;

    this.g.input.onDown.add(({ worldX, worldY }) => {
      if(this.g.input.activePointer.rightButton.isDown) return;

      if(!this.map || !this.map.objects) return;

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
    return this.isRenderingEagleEye || (!fluid[tileCheck] && !foliage[tileCheck]);
  }

  private showItemSprites(centerX, centerY) {
    for(let x = centerX - 4; x <= centerX + 4; x++) {

      const xKey = `x${x}`;
      const itemPatchX = this.clientGameState.groundItems[xKey];
      if(!itemPatchX) continue;

      for(let y = centerY - 4; y <= centerY + 4; y++) {

        const yKey = `y${y}`;
        const itemPatchY = this.clientGameState.groundItems[xKey][yKey];
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

    forEach(this.clientGameState.mapNPCs, npc => {
      if(this.notInRange(centerX, centerY, npc.x, npc.y) || npc.dir === 'C') {
        removeUUIDs.push(npc.uuid);
        return;
      }

      const currentSprite = this.visibleNPCUUIDHash[npc.uuid];
      if(currentSprite) {
        currentSprite.x = npc.x * 64;
        currentSprite.y = npc.y * 64;
        currentSprite.frame = npc.sprite + this.getSpriteOffsetForDirection(npc.dir);
        currentSprite.visible = this.player.canSeeThroughStealthOf(npc);
        return;
      }

      const sprite = this.g.add.sprite(npc.x * 64, npc.y * 64, 'Creatures', npc.sprite);
      sprite.uuid = npc.uuid;
      sprite.visible = this.player.canSeeThroughStealthOf(npc);
      sprite.alpha = (<any>npc).totalStats.stealth ? HIDDEN_SPRITE_ALPHA : 1;

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

    const isCorpse = item.itemClass === 'Corpse';
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

      const xKey = `x${x}`;
      const yKey = `y${y}`;

      let ground = this.clientGameState.groundItems[xKey] ? this.clientGameState.groundItems[xKey][yKey] : null;
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

      if(door.isOpen) doorSprite.frame = doorSprite._baseFrame + 1;
      else            doorSprite.frame = doorSprite._baseFrame;

      if(doorSprite._doorTopSprite) {
        doorSprite._doorTopSprite.visible = door.isOpen;
      }

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

    const loadingText = this.g.add.text(288, 288, 'Loading... 0% complete (0/0)', textStyle);
    loadingText.anchor.set(0.5, 0);
    loadingText.fixedToCamera = true;

    loadingText.bringToTop();

    this.g.load.onLoadStart.add(() => {
      loadingText.setText('Loading... 0% complete (0/0)');
    });

    this.g.load.onFileComplete.add((progress, cacheKeyForLoaded, success, totalLoaded, totalFiles) => {
      loadingText.setText(`Loading... ${progress}% complete (${totalLoaded}/${totalFiles})`);
    });

    this.g.load.onLoadComplete.add(() => {
      loadingText.destroy();
    });
  }

  private createLayers() {

    this.groups.Decor = this.g.add.group();
    this.groups.DenseDecor = this.g.add.group();
    this.groups.OpaqueDecor = this.g.add.group();

    this.itemsOnGround = this.g.add.group();

    this.groups.Interactables = this.g.add.group();

    this.otherEnvironmentalObjects = this.g.add.group();
    this.vfx = this.g.add.group();
    this.visibleNPCs = this.g.add.group();
    this.otherPlayerSprites = this.g.add.group();
  }

  private drawEnvironmentalObjects(centerX, centerY) {
    const removeTimestamps = [];

    const foundTimestamps = {};

    this.clientGameState.environmentalObjects.forEach(obj => {
      if(!obj.properties || !obj.properties.timestamp) return;

      foundTimestamps[obj.properties.timestamp] = true;

      if(this.notInRange(centerX, centerY, obj.x / 64, obj.y / 64)) {
        removeTimestamps.push(obj.properties.timestamp);
        return;
      }

      if(this.environmentalObjectHash[obj.properties.timestamp]) return;

      if(this.player.getTotalStat('perception') < obj.properties.setStealth
      && obj.properties.caster.username !== this.player.username) return;

      const spriteInfo = ENVIRONMENTAL_OBJECT_GID_HASH[obj.type];
      const sprite = this.g.add.sprite(obj.x, obj.y - 64, spriteInfo.image, spriteInfo.gid);
      this.otherEnvironmentalObjects.add(sprite);
      this.environmentalObjectHash[obj.properties.timestamp] = sprite;
    });

    const existingTimestamps = Object.keys(foundTimestamps);
    const allTimestamps = Object.keys(this.environmentalObjectHash);

    const otherRemoveTimestamps = difference(allTimestamps, existingTimestamps);

    removeTimestamps.concat(otherRemoveTimestamps).forEach(timestamp => {
      const sprite = this.environmentalObjectHash[timestamp];
      if(!sprite) return;
      delete this.environmentalObjectHash[timestamp];
      sprite.destroy();
    });
  }

  private createNewPlayers() {
    this.playersNeedingCreation.forEach(player => {
      this.createPlayer(player);
    });

    this.playersNeedingCreation = [];
  }

  preload() {
    this.g.lockRender = false;
    this.g.load.crossOrigin = 'anonymous';

    this.g.load.onFileError.add((key, file) => {
      console.error(`File load error "${key}": ${file}`);
    });

    this.setupPhaser();

    this.isLoaded = false;

    this.g.add.plugin(new TiledPlugin(this.g, this.g.stage));

    const loadMap = this.clientGameState.map;

    // remove unused tileset to prevent warnings since things on a layer that uses this tileset are handled manually
    loadMap.tilesets.length = 3;

    this.cacheMap(loadMap);

    this.g.load.tiledmap(cacheKey(this.clientGameState.mapName, 'tiledmap'), null, loadMap, (<any>window).Phaser.Tilemap.TILED_JSON);

    this.g.load.image(cacheKey(this.clientGameState.mapName, 'tileset', 'Terrain'), this.assetService.terrainUrl, 64, 64);
    this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Walls'), this.assetService.wallsUrl, 64, 64);
    this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Decor'), this.assetService.decorUrl, 64, 64);

    this.g.load.spritesheet('Swimming', this.assetService.swimmingUrl, 64, 64);
    this.g.load.spritesheet('Creatures', this.assetService.creaturesUrl, 64, 64);
    this.g.load.spritesheet('Items', this.assetService.itemsUrl, 64, 64);
    this.g.load.spritesheet('Effects', this.assetService.effectsUrl, 64, 64);

    bgms.forEach(bgm => {
      this.g.load.audio(`bgm-${bgm}`, `${this.assetService.assetUrl}/bgm/${bgm}.mp3`);
    });

    sfxs.forEach(sfx => {
      this.g.load.audio(`sfx-${sfx}`, `${this.assetService.assetUrl}/sfx/${sfx}.mp3`);
    });

    this.setupLoadingListeners();
  }

  create() {

    bgms.forEach(bgm => {
      this.bgms[bgm] = this.g.add.audio(`bgm-${bgm}`);
    });

    sfxs.forEach(sfx => {
      this.sfxs[sfx] = this.g.add.audio(`sfx-${sfx}`);
    });

    if(!this.clientGameState.mapName) return;

    this.map = this.g.add.tiledmap(this.clientGameState.mapName);

    this.createLayers();
    this.createPlayer(this.player);

    // probably an early exit
    if(this.map.tilesets.length === 0) return;

    const decorFirstGid = this.map.tilesets[2].firstgid;
    const wallFirstGid = this.map.tilesets[1].firstgid;

    const isPlayerSub = this.colyseus.isSubscribed;

    const parseLayer = (layer) => {
      layer.objects.forEach(obj => {
        const isWall = obj.gid < decorFirstGid;
        const firstGid = isWall ? wallFirstGid : decorFirstGid;
        const tileSet = isWall ? 'Walls' : 'Decor';

        const sprite = this.g.add.sprite(obj.x, obj.y - 64, cacheKey(this.clientGameState.mapName, 'tileset', tileSet), obj.gid - firstGid);
        sprite._baseFrame = sprite.frame;

        if(obj.type === 'StairsUp' || obj.type === 'StairsDown') {
          sprite.inputEnabled = true;

          sprite.events.onInputDown.add(() => {
            if(this.player.x !== sprite.x / 64 || this.player.y !== sprite.y / 64) return;

            this.colyseus.game.currentCommand = obj.type === 'StairsUp' ? 'up' : 'down';

          });
        }

        if(obj.type === 'Door' && VerticalDoorGids[sprite._baseFrame]) {
          const doorTopSprite = this.g.add.sprite(obj.x, obj.y - 128, cacheKey(this.clientGameState.mapName, 'tileset', tileSet), obj.gid - firstGid + 2);
          doorTopSprite.visible = false;
          sprite._doorTopSprite = doorTopSprite;
        }

        this.groups[layer.name].add(sprite);

        if(layer.name === 'Interactables') {
          if(obj.properties && obj.properties.subscriberOnly) {
            sprite.visible = isPlayerSub;
          }
        }
      });
    };

    ['Decor', 'DenseDecor', 'OpaqueDecor', 'Interactables'].forEach((layer, index) => {
      parseLayer(this.map.objects[index]);
    });

    this.g.camera.fade('#000', 1);
  }

  update() {
    if(!this.colyseus.game._inGame || !this.player) return;

    // center on player mid
    this.focusCameraOnPlayer();
  }

  render() {
    if(!this.colyseus.game._inGame || !this.player) return;

    if(!this.hasFlashed) {
      this.hasFlashed = true;

      this.g.camera.flash('#000', 500);
      this.isLoaded = true;
    }

    if(this.clientGameState.updates.openDoors.length > 0) {
      this.updateDoors();
    }

    this.createNewPlayers();

    this.removeOldItemSprites(this.player.x, this.player.y);
    this.showItemSprites(this.player.x, this.player.y);

    this.showNPCSprites(this.player.x, this.player.y);
    this.drawEnvironmentalObjects(this.player.x, this.player.y);
  }
}
