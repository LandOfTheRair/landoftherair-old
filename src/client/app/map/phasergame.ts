
import * as TiledPlugin from 'phaser-tiled';

import { find, compact, difference, values, forEach, get, startCase } from 'lodash';

import { ClientGameState } from '../clientgamestate';

import { Player } from '../../../shared/models/player';
import { Sex, Direction, Allegiance } from '../../../shared/models/character';
import { Item } from '../../../shared/models/item';
import { TrueSightMap, TrueSightMapReversed, VerticalDoorGids } from './phaserconversionmaps';
import { MapLayer } from '../../../shared/models/maplayer';

import { BehaviorSubject } from 'rxjs';

const cacheKey = TiledPlugin.utils.cacheKey;

enum TilesWithNoFOVUpdate {
  Empty = 0,
  Air = 2386
}

const SFXMap = {
  'combat self block armor': 'combat-block-armor',
  'combat self block weapon': 'combat-block-weapon',
  'combat self miss': 'combat-miss',
  'combat other kill': 'combat-die',
  'combat notme kill player': 'combat-die',
  'combat notme kill npc': 'combat-kill',
  'combat self kill npc': 'combat-kill',
  'combat self kill player': 'combat-die',
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
  private skipLoading: boolean;
  private oldMapName: string;

  private visibleNPCUUIDHash = {};
  private visibleItemUUIDHash = {};
  private visibleSprites = {};
  private playerSpriteHash = {};
  private environmentalObjectHash = {};

  // groups
  private itemsOnGround: any;
  private otherEnvironmentalObjects: any;
  private doorTops: any;
  private visibleNPCs: any;
  private otherPlayerSprites: any;
  private myPlayerSprite: any;
  private vfx: any;

  private isRenderingTruesight: boolean;
  private isRenderingEagleEye: boolean;

  private groups: any = {
    Decor: {},
    DenseDecor: {},
    OpaqueDecor: {},
    Interactables: {}
  };

  private currentBgm: string;
  private bgms = {};
  private sfxs = {};

  public isLoaded: boolean;
  private hasFlashed: boolean;

  private fovGroup: any = {};
  private fovSprites: any = {};   // horizontal fov sprites
  private fovSprites2: any = {};  // extra fov sprites for vertical layering

  private goldGroup: any = {};
  private goldSprites: any = {};

  public get shouldRender() {
    if(!this.player) return false;
    if(!this.colyseus.game._inGame || !this.colyseus.game.isRenderReady) return false;
    if(!this.g || !this.g.camera) return false;

    const point = this.g.camera.position;
    return point.x !== 0 || point.y !== 0;
  }

  private get player() {
    return this.clientGameState.currentPlayer;
  }

  get g(): any {
    return <any>this;
  }

  public loadingText = new BehaviorSubject<string>('');

  constructor(private clientGameState: ClientGameState, private assetService, public colyseus) {

    // reset any time inGame is set to true
    this.colyseus.game.inGame$.subscribe(inGame => {
      // this.reset();

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
  }

  private drawVfx({ effect, tiles }) {
    if(!this.vfx) return;

    tiles.forEach(({ x, y }) => {

      try {
        const sprite = this.g.add.sprite(x * 64, y * 64, 'Effects', effect);
        this.vfx.add(sprite);

        setTimeout(() => {
          sprite.destroy();
        }, 2000);

      // this error happens when visual effects happen but the game isn't loaded
      } catch(e) {}
    });
  }

  private playSfx(sfx: string) {
    const convertSfx = SFXMap[sfx];

    if(!this.sfxs[convertSfx] || !this.sfxs[convertSfx].isDecoded) return;

    // this happens periodically, but we probably can't do anything about it
    try {
      this.sfxs[convertSfx].play();
    } catch(e) {}
  }

  private updateBgm(newBgm: string) {
    if(!newBgm && this.currentBgm && this.bgms[this.currentBgm]) {
      this.bgms[this.currentBgm].stop();
      this.currentBgm = '';
      return;
    }

    if(newBgm === this.currentBgm) return;

    if(this.currentBgm && this.bgms[this.currentBgm]) {
      this.bgms[this.currentBgm].stop();
    }

    if(this.bgms[newBgm] && this.bgms[newBgm].isDecoded) {
      this.currentBgm = newBgm;
      this.bgms[this.currentBgm].loopFull();
    }

  }

  public reset(skipLoading = false) {
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

    if(this.doorTops) {
      this.doorTops.destroy();
    }

    if(this.visibleNPCs) {
      this.visibleNPCs.destroy();
    }

    if(this.otherPlayerSprites) {
      this.otherPlayerSprites.destroy();
    }

    if(this.myPlayerSprite) {
      this.myPlayerSprite.destroy();
    }

    if(this.vfx) {
      this.vfx.destroy();
    }

    if(this.fovGroup && this.fovGroup.destroy) {
      this.fovGroup.destroy();
    }

    if(this.goldGroup && this.goldGroup.destroy) {
      this.goldGroup.destroy();
    }

    this.visibleNPCUUIDHash = {};
    this.visibleItemUUIDHash = {};
    this.visibleSprites = {};
    this.playerSpriteHash = {};
    this.environmentalObjectHash = {};

    this.fovSprites = {};
    this.fovSprites2 = {};
    this.goldSprites = {};

    if(!skipLoading) {

      Object.keys(this.bgms).forEach(bgm => {
        if(!this.bgms[bgm] || !this.bgms[bgm].isDecoded) return;
        this.bgms[bgm].destroy();
      });

      Object.keys(this.sfxs).forEach(sfx => {
        if(!this.sfxs[sfx] || !this.sfxs[sfx].isDecoded) return;
        this.sfxs[sfx].destroy();
      });

      this.bgms = {};
      this.sfxs = {};

      this.playerSprite = null;
    }

    this.isRenderingTruesight = false;
    this.isRenderingEagleEye = false;

    this.skipLoading = skipLoading;
  }

  private focusCameraOnPlayer() {
    if(!this.g || !this.g.camera || !this.player) return;
    this.g.camera.focusOnXY((this.player.x * 64) + 32, (this.player.y * 64) + 32);
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
    } else {
      sprite.visible = !player.isDead();
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

  public isSamePlayer(username: string): boolean {
    if(!this.player) return false;
    return username === this.player.username;
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

  private canCreateItemSpriteAt(x, y): boolean {
    if(!this.clientGameState.map) return false;

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
          this.createTreasureSprite(x, y);
        });
      }
    }
  }

  private showNPCSprites(centerX, centerY) {
    const removeUUIDs = [];

    forEach(this.clientGameState.mapNPCs, npc => {
      if(this.notInRange(centerX, centerY, npc.x, npc.y) || npc.dir === 'C' || npc.hp.__current === 0) {
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

  private goldSpriteForLocation(x, y) {
    const hasGold = (checkX, checkY) => get(this.clientGameState.groundItems, [`x${checkX}`, `y${checkY}`, 'Coin'], false);

    // check and abort early
    const goldHere = hasGold(x, y) && this.canCreateItemSpriteAt(x, y);
    if(!goldHere) return 0;

    const goldNW = hasGold(x - 1, y - 1) && this.canCreateItemSpriteAt(x - 1, y - 1);
    const goldN  = hasGold(x,     y - 1) && this.canCreateItemSpriteAt(x,        y - 1);
    const goldNE = hasGold(x + 1, y - 1) && this.canCreateItemSpriteAt(x + 1, y - 1);
    const goldE =  hasGold(x + 1, y)     && this.canCreateItemSpriteAt(x + 1, y);
    const goldSE = hasGold(x + 1, y + 1) && this.canCreateItemSpriteAt(x + 1, y + 1);
    const goldS  = hasGold(x,     y + 1) && this.canCreateItemSpriteAt(x,     y + 1);
    const goldSW = hasGold(x - 1, y + 1) && this.canCreateItemSpriteAt(x - 1, y + 1);
    const goldW  = hasGold(x - 1, y)     && this.canCreateItemSpriteAt(x - 1, y);

    if(!goldNW && goldN && goldNE && goldE && goldSE && goldS && goldSW && goldW) return 337; // NW corner missing
    if(goldNW && goldN && !goldNE && goldE && goldSE && goldS && goldSW && goldW) return 338; // NE corner missing
    if(goldNW && goldN && goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 339; // SE corner missing
    if(goldNW && goldN && goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 340; // SW corner missing

    if(!goldNW && goldN && !goldNE && goldE && goldSE && goldS && goldSW && goldW) return 341;  // NE,NW corner missing
    if(goldNW && goldN && !goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 342;  // NE,SE corner missing
    if(goldNW && goldN && goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 343;  // SE,SW corner missing
    if(!goldNW && goldN && goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 344;  // SW,NW corner missing

    if(!goldNW && goldN && !goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 345; // NW,NE,SW corner missing
    if(!goldNW && goldN && !goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 346; // NW,NE,SE corner missing
    if(goldNW && goldN && !goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 347; // NE,SE,SW corner missing
    if(!goldNW && goldN && goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 348; // NW,SE,SW corner missing

    if(!goldNW && goldN && !goldNE && goldE && !goldSE && goldS && !goldSW && goldW) return 349;  // ALL corner missing

    if(!goldN && goldE && goldSE && goldS && goldSW && goldW) return 350; // N missing NE,NW unchecked
    if(goldNW && goldN && !goldE && goldS && goldSW && goldW) return 351; // E missing NE,SE unchecked
    if(goldNW && goldN && goldNE && goldE && !goldS && goldW) return 352; // S missing SE,SW unchecked
    if(goldN && goldNE && goldE && goldSE && goldS && !goldW) return 353; // W missing SW,NW unchecked

    if(!goldNW && goldN && goldNE && goldE && !goldS && goldW) return 354;  // NW,S missing SE,SW unchecked
    if(goldNW && goldN && !goldNE && goldE && !goldS && goldW) return 355;  // NE,S missing SE,SW unchecked
    if(!goldN && goldE && !goldSE && goldS && goldSW && goldW) return 356;  // SE,N missing NE,NW unchecked
    if(!goldN && goldE && goldSE && goldS && !goldSW && goldW) return 357;  // SW,N missing NE,NW unchecked

    if(!goldNW && goldN && !goldE && goldS && goldSW && goldW) return 358;  // NW,E missing NE,SE unchecked
    if(goldN && !goldNE && goldE && goldSE && goldS && !goldW) return 359;  // NE,W missing NW,SW unchecked
    if(goldN && goldNE && goldE && !goldSE && goldS && !goldW) return 360;  // SE,W missing NW,SW unchecked
    if(goldNW && goldN && !goldE && goldS && !goldSW && goldW) return 361;  // SW,E missing NE,SE unchecked

    if(!goldN && goldE && !goldSE && goldS && !goldSW && goldW) return 362; // SE,SW,N missing NW,NE unchecked
    if(!goldNW && goldN && !goldE && goldS && !goldSW && goldW) return 363; // NW,SW,E missing SE,NE unchecked
    if(!goldNW && goldN && !goldNE && goldE && !goldS && goldW) return 364; // NE,NW,S missing SE,SW unchecked
    if(goldN && !goldNE && goldE && !goldSE && goldS && !goldW) return 365; // NE,SE,W missing NW,SW unchecked

    if(!goldN && goldE && goldSE && goldS && !goldW) return 366; // E,SE,S present, NE,SW,NW unchecked
    if(!goldN && !goldE && goldS && goldSW && goldW) return 367; // W,SW,S present, NW,SE,NE unchecked
    if(goldNW && goldN && !goldE && !goldS && goldW) return 368; // W,NW,N present, NE,SE,SW unchecked
    if(goldN && goldNE && goldE && !goldS && !goldW) return 369; // E,NE,N present, NW,SE,SW unchecked

    if(!goldN && goldE && goldS && !goldW) return 370;  // E,S present, CORNERS unchecked
    if(!goldN && !goldE && goldS && goldW) return 371;  // W,S present, CORNERS unchecked
    if(goldN && !goldE && !goldS && goldW) return 372;  // W,N present, CORNERS unchecked
    if(goldN && goldE && !goldS && !goldW) return 373;  // E,N present, CORNERS unchecked

    if(!goldN && !goldE && goldS && !goldW) return 374; // S present, CORNERS unchecked
    if(!goldN && !goldE && !goldS && goldW) return 375; // W present, CORNERS unchecked
    if(goldN && !goldE && !goldS && !goldW) return 376; // N present, CORNERS unchecked
    if(!goldN && goldE && !goldS && !goldW) return 377; // E present, CORNERS unchecked

    if(goldN && !goldE && goldS && !goldW) return 378;  // N,S present, CORNERS unchecked
    if(!goldN && goldE && !goldS && goldW) return 379;  // E,W present, CORNERS unchecked

    if(!goldNW && goldN && goldNE && goldE && !goldSE && goldS && goldSW && goldW) return 380;  // NW,SE missing
    if(goldNW && goldN && !goldNE && goldE && goldSE && goldS && !goldSW && goldW) return 381;  // NE,SW missing

    if(goldNW && goldN && goldNE && goldE && goldSE && goldS && goldSW && goldW) return 382;  // ALL present

    return 336;
  }

  private createTreasureSprite(x, y) {
    const spritePos = this.goldSpriteForLocation(x, y);
    if(!spritePos) return;

    if(!this.goldSprites[x]) this.goldSprites[x] = {};

    const currentItemSprite = this.goldSprites[x][y];

    if(currentItemSprite) {
      if(spritePos === currentItemSprite.frame) return;
      currentItemSprite.destroy();
    }

    const sprite = this.g.add.sprite(x * 64, y * 64, cacheKey(this.clientGameState.mapName, 'tileset', 'Terrain'), spritePos);
    this.goldSprites[x][y] = sprite;

    this.goldGroup.add(sprite);
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

    this.goldGroup.children.forEach(sprite => {
      const x = sprite.x / 64;
      const y = sprite.y / 64;

      const xKey = `x${x}`;
      const yKey = `y${y}`;

      let ground = this.clientGameState.groundItems[xKey] ? this.clientGameState.groundItems[xKey][yKey] : null;
      ground = ground || {};

      if(this.notInRange(centerX, centerY, x, y) || !ground.Coin) this.goldSprites[x][y] = null;
      this.goldGroup.removeChild(sprite);
      sprite.destroy();
    })
  }

  public cacheMap(mapData) {
    if(!mapData) return;
    this.g.load.tiledmap(cacheKey(this.clientGameState.mapName, 'tiledmap'), null, mapData, (<any>window).Phaser.Tilemap.TILED_JSON);
  }

  public updateDoors() {
     this.clientGameState.updates.openDoors.forEach((doorId, i) => {
      const door = this.clientGameState.mapData.openDoors[doorId];
      if(!door) return;

      const doorSprite: any = find(this.groups.Interactables.children, { x: door.x, y: door.y });
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

    this.g.load.onLoadStart.add(() => {
      this.loadingText.next('Loading... 0% complete (0/0)');
    });

    this.g.load.onFileComplete.add((progress, cacheKeyForLoaded, success, totalLoaded, totalFiles) => {
      this.loadingText.next(`Loading... ${progress}% complete (${totalLoaded}/${totalFiles})`);
    });

    this.g.load.onLoadComplete.add(() => {
      setTimeout(() => {
        this.loadingText.next(`Welcome to ${startCase(this.clientGameState.mapName)}!`);

        setTimeout(() => {
          this.loadingText.next('');
        }, 1000);

      }, 1000);
    });
  }

  private createLayers() {

    this.groups.Decor = this.g.add.group();
    this.groups.DenseDecor = this.g.add.group();
    this.groups.OpaqueDecor = this.g.add.group();

    this.goldGroup = this.g.add.group();
    this.itemsOnGround = this.g.add.group();

    this.groups.Interactables = this.g.add.group();
    this.doorTops = this.g.add.group();

    this.otherEnvironmentalObjects = this.g.add.group();
    this.vfx = this.g.add.group();
    this.visibleNPCs = this.g.add.group();
    this.otherPlayerSprites = this.g.add.group();
    this.myPlayerSprite = this.g.add.group();

    this.fovGroup = this.g.add.group();
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

      if(obj.properties.setStealth
      && this.player.getTotalStat('perception') < obj.properties.setStealth
      && obj.properties.caster.username !== this.player.username) return;

      const spriteInfo = obj.gid && obj.image
                     ? { image: cacheKey(this.clientGameState.mapName, 'tileset', obj.image), gid: obj.gid }
                     : ENVIRONMENTAL_OBJECT_GID_HASH[obj.type];

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

  private createPlayerSprites() {
    this.clientGameState.players.forEach(player => {
      let sprite = this.playerSpriteHash[player.uuid];

      if(!sprite) {
        sprite = this.getPlayerSprite(player);
        this.playerSpriteHash[player.uuid] = sprite;
        this.otherPlayerSprites.add(sprite);

        if(this.isSamePlayer(player.username)) {
          this.playerSprite = sprite;
        }

      } else {

        if(this.isSamePlayer(player.username)) {
          this.updatePlayerSprite(this.playerSprite, player);
        } else {
          this.updatePlayerSprite(sprite, player);
        }

      }

      if(this.isSamePlayer(player.username)) {
        this.eagleeyeCheck();
        this.truesightCheck();
        this.focusCameraOnPlayer();
      }
    });
  }

  private removeOldPlayerSprites() {
    Object.keys(this.playerSpriteHash).forEach(playerUUID => {
      const isPlayerInHash = this.clientGameState.findPlayer(playerUUID);
      if(isPlayerInHash) return;

      const sprite = this.playerSpriteHash[playerUUID];
      sprite.destroy();
      delete this.playerSpriteHash[playerUUID];
    });
  }

  private isThereAWallAt(checkX: number, checkY: number) {
    if(!this.player) return false;

    const map = this.map;
    const { size, layers } = map;
    const { x, y } = this.player;

    const totalX = x + checkX;
    const totalY = y + checkY;

    const hasSecretWall = get(this.clientGameState.secretWallHash, [totalX, totalY]);
    const wallList = layers[MapLayer.Walls].data || layers[MapLayer.Walls].tileIds;
    const wallLayerTile = wallList[(size.x * totalY) + totalX];

    return (hasSecretWall && !this.isRenderingTruesight) || (wallLayerTile !== TilesWithNoFOVUpdate.Empty && wallLayerTile !== TilesWithNoFOVUpdate.Air);
  }

  private isDarkAt(x: number, y: number) {
    return get(this.clientGameState.darkness, ['x' + (x + this.player.x), 'y' + (y + this.player.y)]);
  }

  private isLightAt(x: number, y: number) {
    if(!this.player) return false;

    const lightVal = this.isDarkAt(x, y);
    return !lightVal || lightVal < -1;
  }

  private canDarkSee(x: number, y: number) {
    if(!this.player) return false;
    if(this.player.hasEffect('Blind')) return false;

    const darkCheck = this.isDarkAt(x, y);
    return (darkCheck === -1 || darkCheck > 0) && this.player.hasEffect('DarkVision');
  }

  private shouldRenderXY(x: number, y: number) {
    return get(this.colyseus.game.clientGameState.fov, [x, y]);
  }

  private updateFOV() {
    const isPlayerInHash = this.playerSpriteHash[this.player.username];

    for(let x = -4; x <= 4; x++) {
      for(let y = -4; y <= 4; y++) {
        const fovState = this.shouldRenderXY(x, y);
        const fovSprite = this.fovSprites[x][y];
        const fovSprite2 = this.fovSprites2[x][y];

        fovSprite.scale.set(1, 1);
        fovSprite.cameraOffset.x = 64 * (x + 4);
        fovSprite.cameraOffset.y = 64 * (y + 4);

        fovSprite2.scale.set(1, 1);
        fovSprite2.cameraOffset.x = 64 * (x + 4);
        fovSprite2.cameraOffset.y = 64 * (y + 4);

        if(!isPlayerInHash) {
          fovSprite.alpha = 1;
          continue;
        }

        // tile effects
        if(fovState && this.isDarkAt(x, y)) {
          if(this.isLightAt(x, y)) {
            fovSprite.alpha = 0;
            continue;
          }

          if(this.canDarkSee(x, y)) {
            fovSprite.alpha = 0.5;
            continue;
          }
        }

        fovSprite.alpha = fovState ? 0 : 1;
        fovSprite2.alpha = fovState ? 0 : 1;

        // cut tiles
        if(fovState) {
          const isWallHere = this.isThereAWallAt(x, y);
          if(!isWallHere) continue;

          // FOV SPRITE 2 IS USED HERE SO IT CAN LAYER ON TOP OF THE OTHER ONES
          if(y === 4                                                 // cut down IIF the wall *is* the edge tile (scale down to y0.5, y + ~32)
            || (y + 1 <= 4 && !this.shouldRenderXY(x, y + 1))) {  // cut down (scale down to y0.5, y + ~32)

            fovSprite2.alpha = 1;
            fovSprite2.scale.y = 0.7;
            fovSprite2.cameraOffset.y += 20;
          }

          if(x === -4                                              // cut left IIF the wall *is* the edge tile (scale down to x0.5, no offset)
          || (x - 1 >= -4 && !this.shouldRenderXY(x - 1, y))) { // cut left (scale down to x0.5, no offset)

            // if the tile is black on both sides, it should be black regardless
            if(!this.shouldRenderXY(x + 1, y)) {
              fovSprite.alpha = 1;
              continue;
            }

            fovSprite.alpha = 1;
            fovSprite.scale.x = 0.35;
            continue;
          }


          if(x === 4                                               // cut right IIF the wall *is* the edge tile (scale down to x0.5, x + ~32)
          || (x + 1 <= 4 && !this.shouldRenderXY(x + 1, y))) {  // cut right (scale down to x0.5, x + ~32)

            // if the tile is black on both sides, it should be black regardless
            if(!this.shouldRenderXY(x - 1, y)) {
              fovSprite.alpha = 1;
              continue;
            }

            fovSprite.alpha = 1;
            fovSprite.scale.x = 0.35;
            fovSprite.cameraOffset.x += 42;
            continue;
          }
        }

      }
    }
  }

  private createFOV() {
    const blackBitmapData = this.g.add.bitmapData(64, 64);
    blackBitmapData.ctx.beginPath();
    blackBitmapData.ctx.rect(0, 0, 64, 64);
    blackBitmapData.ctx.fillStyle = '#000';
    blackBitmapData.ctx.fill();

    /*
    const debugBitmapData = this.g.add.bitmapData(64, 64);
    debugBitmapData.ctx.beginPath();
    debugBitmapData.ctx.rect(0, 0, 64, 64);
    debugBitmapData.ctx.fillStyle = '#0f0';
    debugBitmapData.ctx.fill();
    */

    for(let x = -4; x <= 4; x++) {
      this.fovSprites[x] = {};
      this.fovSprites2[x] = {};

      for(let y = -4; y <= 4; y++) {
        const dark = this.g.add.sprite(64 * (x + 4), 64 * (y + 4), blackBitmapData);
        dark.alpha = 0;
        dark.fixedToCamera = true;
        this.fovSprites[x][y] = dark;
        this.fovGroup.add(dark);

        const dark2 = this.g.add.sprite(64 * (x + 4), 64 * (y + 4), blackBitmapData);
        dark2.alpha = 0;
        dark2.fixedToCamera = true;
        this.fovSprites2[x][y] = dark2;
        this.fovGroup.add(dark2);
      }
    }
  }

  preload() {
    this.g.lockRender = false;
    this.g.load.crossOrigin = 'anonymous';

    this.g.load.onFileError.add((key, file) => {
      console.error(`File load error "${key}"`, file);
    });

    this.setupPhaser();

    this.g.add.plugin(new TiledPlugin(this.g, this.g.stage));

    this.isLoaded = false;
    this.clientGameState.hasLoadedInGame = false;
    const loadMap = this.clientGameState.map;

    // remove unused tileset to prevent warnings since things on a layer that uses this tileset are handled manually
    loadMap.tilesets.length = 3;

    this.cacheMap(loadMap);
    this.g.load.tiledmap(cacheKey(this.clientGameState.mapName, 'tiledmap'), null, loadMap, (<any>window).Phaser.Tilemap.TILED_JSON);

    if(this.oldMapName && this.skipLoading) {
      ['Terrain', 'Walls', 'Decor'].forEach(key => {
        this.g.cache._cache.image[cacheKey(this.clientGameState.mapName, 'tileset', key)] = this.g.cache._cache.image[cacheKey(this.oldMapName, 'tileset', key)];
      });
    }

    this.oldMapName = this.clientGameState.mapName;

    if(!this.skipLoading) {

      this.setupLoadingListeners();

      this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Terrain'), this.assetService.terrainUrl, 64, 64);
      this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Walls'), this.assetService.wallsUrl, 64, 64);
      this.g.load.spritesheet(cacheKey(this.clientGameState.mapName, 'tileset', 'Decor'), this.assetService.decorUrl, 64, 64);

      this.g.load.spritesheet('Swimming', this.assetService.swimmingUrl, 64, 64);
      this.g.load.spritesheet('Creatures', this.assetService.creaturesUrl, 64, 64);
      this.g.load.spritesheet('Items', this.assetService.itemsUrl, 64, 64);
      this.g.load.spritesheet('Effects', this.assetService.effectsUrl, 64, 64);

      bgms.forEach(bgm => {
        this.g.load.audio(`bgm-${bgm}`, `${this.assetService.assetUrl}/bgm/${bgm}.mp3`);
        this.g.load.audio(`bgm-${bgm}-nostalgia`, `${this.assetService.assetUrl}/bgm/${bgm}-nostalgia.mp3`);
      });

      sfxs.forEach(sfx => {
        this.g.load.audio(`sfx-${sfx}`, `${this.assetService.assetUrl}/sfx/${sfx}.mp3`);
      });
    }
  }

  create() {

    bgms.forEach(bgm => {
      this.bgms[bgm] = this.g.add.audio(`bgm-${bgm}`);
      this.bgms[`${bgm}-nostalgia`] = this.g.add.audio(`bgm-${bgm}-nostalgia`);
    });

    sfxs.forEach(sfx => {
      this.sfxs[sfx] = this.g.add.audio(`sfx-${sfx}`);
    });

    if(!this.clientGameState.mapName) {
      console.error(new Error('Error:Loading - no mapname'));
      return;
    }

    this.map = this.g.add.tiledmap(this.clientGameState.mapName);

    this.createLayers();

    // probably an early exit
    if(this.map.tilesets.length === 0) {
      console.error(new Error('Error:Loading - no map tilesets'));
      return;
    }

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

          sprite.events.onInputDown.add((spr, pointer) => {
            if(!pointer.rightButton.isDown || this.player.x !== sprite.x / 64 || this.player.y !== sprite.y / 64) return;

            this.colyseus.game.sendCommandString(obj.type === 'StairsUp' ? '#up' : '#down');
          });
        }

        if(obj.type === 'Door') {
          sprite.inputEnabled = true;

          sprite.events.onInputDown.add((spr, pointer) => {
            const diffX = (sprite.x / 64) - this.player.x;
            const diffY = (sprite.y / 64) - this.player.y;

            // in a cardinal direction, not diagonal
            const isNearby = (Math.abs(diffX) === 1 || Math.abs(diffY) === 1) && !(Math.abs(diffX) === 1 && Math.abs(diffY) === 1);

            if(!pointer.rightButton.isDown || !isNearby) return;

            this.colyseus.game.sendCommandString(`#open ${this.player.getDirBasedOnDiff(diffX, diffY).substring(0, 1)}`);
          });
        }

        if(obj.type === 'Door' && VerticalDoorGids[sprite._baseFrame]) {
          const doorTopSprite = this.g.add.sprite(obj.x, obj.y - 128, cacheKey(this.clientGameState.mapName, 'tileset', tileSet), obj.gid - firstGid + 2);
          doorTopSprite.visible = false;
          this.doorTops.add(doorTopSprite);
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

    this.createFOV();
    this.updateFOV();

    this.g.camera.fade('#000', 1);

    this.playerSprite = this.getPlayerSprite(this.player);
    this.myPlayerSprite.add(this.playerSprite);
    this.playerSpriteHash[this.player.username] = this.playerSprite;
    this.truesightCheck();
    this.eagleeyeCheck();
    this.focusCameraOnPlayer();

    this.skipLoading = false;

    setTimeout(() => {
      this.g.camera.flash('#000', 1);
      this.isLoaded = true;
      this.clientGameState.hasLoadedInGame = true;
      this.colyseus.game.sendReadyFlag();
    }, 2000);
  }

  update() {
    if(!this.shouldRender) return;

    if(this.clientGameState.updates.openDoors.length > 0) {
      this.updateDoors();
    }

    this.removeOldPlayerSprites();
    this.createPlayerSprites();

    this.updateFOV();

    this.removeOldItemSprites(this.player.x, this.player.y);
    this.showItemSprites(this.player.x, this.player.y);

    this.showNPCSprites(this.player.x, this.player.y);
    this.drawEnvironmentalObjects(this.player.x, this.player.y);
  }
}
