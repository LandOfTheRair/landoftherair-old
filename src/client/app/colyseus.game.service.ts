import { Injectable, NgZone } from '@angular/core';
import { ClientGameState } from './clientgamestate';
import * as swal from 'sweetalert2';

import { Subject } from 'rxjs/Subject';

import { find, includes, findIndex, extend } from 'lodash';
import { Player } from '../../shared/models/player';
import { Item } from '../../shared/models/item';
import { Locker } from '../../shared/models/container/locker';
import { LocalStorageService } from 'ngx-webstorage';
import { Character } from '../../shared/models/character';
import { NPC } from '../../shared/models/npc';

@Injectable()
export class ColyseusGameService {

  client: any;
  colyseus: any;
  clientGameState: ClientGameState = new ClientGameState({});

  worldRoom: any;

  _inGame: boolean;
  _joiningGame: boolean;

  showGround: boolean;
  showTrainer: any = {};
  showShop: any = {};
  showBank: any = {};

  showAlchemy: any = {};

  showLocker: Locker[] = [];
  activeLockerNumber: number;

  currentTarget: string;

  private changingMap: boolean;

  public lastCommands: string[];

  public currentCommand = '';

  public gameCommand$ = new Subject();
  public inGame$ = new Subject();
  public bgm$ = new Subject();
  public sfx$ = new Subject();

  public vfx$ = new Subject();

  public myLoc$ = new Subject();

  private overrideNoBgm: boolean;
  private overrideNoSfx: boolean;

  get deepstream() {
    return this.colyseus.deepstream;
  }

  get character() {
    return this.clientGameState.currentPlayer;
  }

  constructor(
    private localStorage: LocalStorageService,
    private zone: NgZone
  ) {

    this.overrideNoBgm = !this.localStorage.retrieve('playBackgroundMusic');
    this.overrideNoSfx = !this.localStorage.retrieve('playSoundEffects');

    this.localStorage.observe('playBackgroundMusic')
      .subscribe(shouldPlayBgm => {
        this.overrideNoBgm = !shouldPlayBgm;
      });

    this.localStorage.observe('playSoundEffects')
      .subscribe(shouldPlaySfx => {
        this.overrideNoSfx = !shouldPlaySfx;
      });

    this.lastCommands = this.localStorage.retrieve('lastCommands') || [];
  }

  init(colyseus, client, character) {
    this.colyseus = colyseus;
    this.client = client;
    this.setCharacter(character);

    this.clientGameState.loadPlayer$.next();

    this.initGame();

    document.addEventListener('contextmenu', (event) => {
      if(!this._inGame) return;
      event.preventDefault();
      return false;
    });
  }

  get isChangingMap() {
    return this.changingMap;
  }

  get inGame() {
    return this._inGame && this.worldRoom && this.clientGameState.map.type;
  }

  private initGame() {
    if (!this.client) throw new Error('Client not intialized; cannot initialize game connection.');

    this.unshowWindows();

    this.joinRoom(this.character.map);
  }

  private joinRoom(room) {
    this._joiningGame = true;

    this.zone.runOutsideAngular(() => {
      this.resetRoom();

      this.worldRoom = this.client.join(room, {
        charSlot: this.character.charSlot,
        username: this.colyseus.username
      });

      this.initDeepstreamForRoom(room);
      this.clientGameState.setMapNPCs(this.deepstream.allNPCsHash);

      this.worldRoom.onUpdate.addOnce((state) => {
        this.clientGameState.mapName = state.mapName;
        this.clientGameState.grabOldUpdates(state.mapData);

        this.changingMap = false;
      });

      this.worldRoom.onUpdate.add((state) => {
        this.clientGameState.setMapData(state.mapData || {});
        this.clientGameState.setPlayers(state.playerHash);
        this.clientGameState.setEnvironmentalObjects(state.environmentalObjects || []);
        this.clientGameState.setDarkness(state.darkness || {});
        this.setCharacter(state.playerHash[this.colyseus.username]);
      });

      this.worldRoom.onData.add((data) => {
        this.interceptGameCommand(data);
      });

      const updateSpecificAttr = (attr, change) => {
        this.clientGameState.updatePlayer(change.path.id, attr, change.value);
      };

      const updateAgro = (change) => {
        this.clientGameState.updatePlayerAgro(change.path.id, change.path.player, change.value);
      };

      const updateHP = (change) => {
        this.clientGameState.updatePlayerHP(change.path.id, change.path.key, change.value);
      };

      const updateHand = (hand, change) => {
        this.clientGameState.updatePlayerHand(change.path.id, hand, change.value);
      };

      const updateHandItem = (hand, change) => {
        this.clientGameState.updatePlayerHandItem(change.path.id, hand, change.path.attr, change.value);
      };

      const updateGearItem = (slot, change) => {
        this.clientGameState.updatePlayerGearItem(change.path.id, slot, change.value);
      };

      this.worldRoom.listen('playerHash/:id/x', updateSpecificAttr.bind(this, 'x'));
      this.worldRoom.listen('playerHash/:id/y', updateSpecificAttr.bind(this, 'y'));
      this.worldRoom.listen('playerHash/:id/dir', updateSpecificAttr.bind(this, 'dir'));
      this.worldRoom.listen('playerHash/:id/swimLevel', updateSpecificAttr.bind(this, 'swimLevel'));

      this.worldRoom.listen('playerHash/:id/agro/:player', updateAgro);

      this.worldRoom.listen('playerHash/:id/hp/:key', updateHP);

      this.worldRoom.listen('playerHash/:id/leftHand', updateHand.bind(this, 'leftHand'));
      this.worldRoom.listen('playerHash/:id/rightHand', updateHand.bind(this, 'rightHand'));

      this.worldRoom.listen('playerHash/:id/gear/Armor', updateGearItem.bind(this, 'Armor'));
      this.worldRoom.listen('playerHash/:id/gear/Robe1', updateGearItem.bind(this, 'Robe1'));
      this.worldRoom.listen('playerHash/:id/gear/Robe2', updateGearItem.bind(this, 'Robe2'));

      this.worldRoom.listen('playerHash/:id/leftHand/:attr', updateHandItem.bind(this, 'leftHand'));
      this.worldRoom.listen('playerHash/:id/rightHand/:attr', updateHandItem.bind(this, 'rightHand'));

      this.worldRoom.listen('playerHash/:id/leftHand/:attr', updateHandItem.bind(this, 'leftHand'));
      this.worldRoom.listen('playerHash/:id/rightHand/:attr', updateHandItem.bind(this, 'rightHand'));

      this.worldRoom.listen('playerHash/:id/effects/:effect/:attr', (change) => {
        this.clientGameState.updatePlayerEffect(change);
      });

      this.worldRoom.listen('playerHash/:id/totalStats/stealth', (change) => {
        this.clientGameState.updatePlayerStealth(change.path.id, change.value);
      });

      this.worldRoom.listen('playerHash/:id/totalStats/perception', (change) => {
        this.clientGameState.updatePlayerPerception(change.path.id, change.value);
      });

      const updateDoor = (change) => {
        this.clientGameState.modifyDoor(change);
      };

      this.worldRoom.listen('mapData/openDoors/:id', updateDoor);
      this.worldRoom.listen('mapData/openDoors/:id/isOpen', updateDoor);

      this.worldRoom.onJoin.add(() => {
        this.inGame$.next(true);
        this._inGame = true;
      });

      this.worldRoom.onLeave.add(() => {
        this.clientGameState.removeAllPlayers();
        if(this.changingMap) return;
        this.inGame$.next(false);
        this._inGame = false;
        this._joiningGame = false;
      });

      this.worldRoom.onError.add((e) => {
        alert(e);
      });
    });
  }

  private initDeepstreamForRoom(room: string) {
    this.deepstream.init(room);

    const updateGround = (ground) => {
      this.clientGameState.setGroundItems(ground || {});
    };

    // this.deepstream.ground.whenReady(record => updateGround(record.get()));
    this.deepstream.ground$.subscribe(data => updateGround(data));
  }

  private syncCharacterAttributes(x, y, dir, swimLevel) {
    this.character.x = x;
    this.character.y = y;
    this.character.dir = dir;
    this.character.swimLevel = swimLevel;
    this.character.fov = this.clientGameState.fov;

    this.clientGameState.updatePlayer(this.character.username, 'x', x);
    this.clientGameState.updatePlayer(this.character.username, 'y', y);
    this.clientGameState.updatePlayer(this.character.username, 'dir', dir);
    this.clientGameState.updatePlayer(this.character.username, 'swimLevel', swimLevel);

    this.myLoc$.next({ x, y, dir, swimLevel });
  }

  private setCharacter(character) {
    if(!character) return;

    const hasOldCharacter = this.character;

    this.clientGameState.setPlayer(new Player(character));

    if(hasOldCharacter) {
      const { x, y, dir, swimLevel } = hasOldCharacter;
      this.syncCharacterAttributes(x, y, character.dir === 'C' ? 'C' : dir, swimLevel);
    } else {
      this.myLoc$.next({ x: this.character.x, y: this.character.y, dir: this.character.dir });
    }

    // set bgm for the game (considering options)
    if(this.overrideNoBgm) {
      this.bgm$.next('');

    } else {
      if(this.character.combatTicks > 0) {
        this.bgm$.next('combat');
      } else {
        this.bgm$.next(this.character.bgmSetting);
      }
    }

    // update hp/xp/etc for floating boxes
    this.clientGameState.playerBoxes$.next({ newPlayer: this.character, oldPlayer: hasOldCharacter });
  }

  private logMessage({ name, message, subClass, grouping, dirFrom }: any) {
    const isZero = (includes(message, '[0') && includes(message, 'damage]'))
                || (includes(message, 'misses!'))
                || (includes(message, 'blocked by your'));
    if(isZero && this.localStorage.retrieve('suppressZeroDamage')) return;
    if(!grouping || grouping === 'spell') grouping = 'always';
    this.clientGameState.addLogMessage({ name, message, subClass, grouping, dirFrom });

    if(!this.overrideNoSfx) {
      this.sfx$.next(subClass);
    }
  }

  private setTarget(target: string) {
    this.currentTarget = target;
  }

  private interceptGameCommand({ action, error, ...other }) {
    if(error) {
      (<any>swal)({
        titleText: other.prettyErrorName,
        text: other.prettyErrorDesc,
        type: 'error'
      });
      return;
    }

    this.gameCommand$.next({ action, ...other });

    if(other.target)                this.setTarget(other.target);
    if(action === 'draw_effect_r')  return this.drawEffectRadius(other);
    if(action === 'set_map')        return this.setMap(other.map);
    if(action === 'update_locker')  return this.updateLocker(other.locker);
    if(action === 'show_lockers')   return this.showLockerWindow(other.lockers, other.lockerId);
    if(action === 'show_bank')      return this.showBankWindow(other.uuid, other.bankId);
    if(action === 'show_shop')      return this.showShopWindow(other.vendorItems, other.uuid);
    if(action === 'show_trainer')   return this.showTrainerWindow(other.classTrain, other.trainSkills, other.uuid);
    if(action === 'show_alchemy')   return this.showAlchemyWindow(other.uuid);
    if(action === 'show_ground')    return this.showGroundWindow();
    if(action === 'change_map')     return this.changeMap(other.map);
    if(action === 'log_message')    return this.logMessage(other);
    if(action === 'set_character')  return this.setCharacter(other.character);
    if(action === 'update_pos')     return this.updatePos(other.x, other.y, other.dir, other.swimLevel, other.fov);
    if(action === 'update_fov')     return this.updateFOV(other.fov);
  }

  private updateMacros() {
    // this.macroService.resetUsableMacros();
  }

  private updateFOV(fov) {
    this.clientGameState.setFOV(fov);
  }

  private updatePos(x: number, y: number, dir, swimLevel: number, fov) {
    this.clientGameState.setFOV(fov);
    this.syncCharacterAttributes(x, y, dir, swimLevel);
  }

  private drawEffect(effect: number, tiles: any[]) {
    this.vfx$.next({ effect, tiles });
  }

  private drawEffectRadius({ effect, center, radius }: any) {
    const tiles = [];

    for(let x = center.x - radius; x <= center.x + radius; x++) {
      for(let y = center.y - radius; y <= center.y + radius; y++) {
        tiles.push({ x, y });
      }
    }

    this.drawEffect(effect, tiles);
  }

  private setMap(map: any) {
    this.clientGameState.setMap(map);
  }

  private updateActiveWindowForGameWindow(window: string) {
    this.localStorage.store('activeWindow', window);
  }

  private updateLocker(updateLocker: Locker) {
    const locker = find(this.showLocker, { lockerId: updateLocker.lockerId });
    extend(locker, updateLocker);
  }

  private showLockerWindow(lockers, lockerId) {
    this.showLocker = lockers;
    this.updateActiveWindowForGameWindow('locker');
    this.activeLockerNumber = findIndex(lockers, { lockerId });
  }

  private showBankWindow(uuid, bankId) {
    this.showBank = { uuid, bankId };
    this.updateActiveWindowForGameWindow('bank');
  }

  private showShopWindow(vendorItems, uuid) {
    this.showShop = { vendorItems, uuid };
    this.updateActiveWindowForGameWindow('shop');
  }

  private showTrainerWindow(classTrain, trainSkills, uuid) {
    this.showTrainer = { classTrain, trainSkills, uuid };
    this.updateActiveWindowForGameWindow('trainer');
  }

  private showAlchemyWindow(uuid) {
    this.showAlchemy = { uuid };
    this.updateActiveWindowForGameWindow('tradeskillAlchemy');
  }

  public assessSkill(skill) {
    if(!skill || !this.showTrainer.uuid) return;
    this.sendCommandString(`${this.showTrainer.uuid}, assess ${skill}`);
  }

  public train() {
    if(!this.showTrainer.uuid) return;
    this.sendCommandString(`${this.showTrainer.uuid}, train`);
  }

  public learn() {
    if(!this.showTrainer.uuid) return;
    this.sendCommandString(`${this.showTrainer.uuid}, learn`);
  }

  public join() {
    if(!this.showTrainer.uuid) return;
    this.sendCommandString(`${this.showTrainer.uuid}, join`);
  }

  public withdraw(amount: number) {
    if(!this.showBank.uuid) return;
    this.sendCommandString(`${this.showBank.uuid}, withdraw ${amount}`);
  }

  public deposit(amount: number) {
    if(!this.showBank.uuid) return;
    this.sendCommandString(`${this.showBank.uuid}, deposit ${amount}`);
  }

  private changeMap(map) {
    this.changingMap = true;
    this.joinRoom(map);
  }

  private showGroundWindow() {
    this.showGround = true;
  }

  private sendAction(data) {
    data.t = Date.now();
    this.worldRoom.send(data);
  }

  public sendRawCommand(command: string, args: string) {
    this.sendAction({ command, args });
  }

  private parseCommand(cmd: string) {

    const arr = cmd.split(' ');
    const multiPrefixes = ['party', 'look', 'show', 'climb', 'cast'];

    let argsIndex = 1;

    let command = arr[0];

    if(includes(multiPrefixes, command)) {
      command = `${arr[0]} ${arr[1]}`;
      argsIndex = 2;
    }

    // factor in the space because otherwise indexOf can do funky things.
    const args = arr.length > argsIndex ? cmd.substring(cmd.indexOf(' ' + arr[argsIndex])).trim() : '';

    return [command, args];
  }

  public doCommand(command) {

    if(this.lastCommands[0] === command) return;

    this.lastCommands.unshift(command);
    if(this.lastCommands.length > 20) this.lastCommands.length = 20;

    // trigger ngx-webstorage writes
    this.localStorage.store('lastCommands', this.lastCommands);
  }

  public sendCommandString(str: string, target?: string) {
    str.split(';').forEach(cmd => {
      cmd = cmd.trim();

      if(cmd === '.' && this.lastCommands[0]) {
        cmd = this.lastCommands[0];
      } else if(!includes(cmd, ', hello')) {
        this.doCommand(cmd);
      }

      let command = '';
      let args = '';

      if(includes(cmd, ',')) {
        command = '~talk';
        args = cmd;
      } else {
        [command, args] = this.parseCommand(cmd);
      }

      if(target) {
        args = `${args} ${target}`;
      }

      this.sendAction({ command, args: args.trim() });
    });
  }

  private unshowWindows() {
    this.showTrainer = {};
    this.showShop = {};
    this.showBank = {};
    this.showLocker = [];
    this.showAlchemy = {};
  }

  public doMove(x, y) {
    this.sendAction({ command: '~move', x, y });
    this.unshowWindows();
  }

  public doInteract(x, y) {
    this.sendAction({ command: '~interact', x, y });
  }

  private resetRoom() {
    if(!this.worldRoom) return;
    this.colyseus.deepstream.uninit();
    this.worldRoom.leave();
    delete this.worldRoom;
  }

  public quit() {
    this.unshowWindows();
    this.clientGameState.reset();

    this.resetRoom();

    if(this.colyseus && this.colyseus.lobby) {
      this.colyseus.lobby.quit();
    }
  }

  public buildDropAction({ dragData }, choice) {
    const { context, contextSlot, count, containerUUID, item } = dragData;
    if(context.substring(0, 1) === choice.substring(0, 1)) return;
    this.buildAction(item, { context, contextSlot, count, containerUUID }, choice);
  }

  public async buildAction(item, { context, contextSlot, count, containerUUID }, choice) {
    const contextStr = context.substring(0, 1);
    const choiceStr = choice.substring(0, 1);
    const cmd = `~${contextStr}t${choiceStr}`;

    if(contextStr === choiceStr) return;

    let args = '';
    let postargs = '';

    const splitpostargs = choice.split(':');

    // TO a tradeskill container
    if(splitpostargs.length === 3) {
      const [t, skill, slot] = splitpostargs;
      if(!this['show' + skill]) return;
      postargs = `${skill.toLowerCase()} ${slot} ${this['show' + skill].uuid}`.trim();
    }

    const splitcontextargs = context.split(':');

    // FROM a tradeskill container
    if(splitcontextargs.length === 2) {
      const [t, skill] = splitcontextargs;
      if(!this['show' + skill]) return;
      postargs = `${skill.toLowerCase()} ${contextSlot} ${this['show' + skill].uuid}`.trim();
    }

    if(context === 'Ground') {
      args = `${item.itemClass} ${item.uuid}`;

    } else if(context === 'GroundGroup') {
      args = `${item.itemClass}`;

    } else if(includes(['Sack', 'Belt', 'Equipment'], context)) {
      args = `${contextSlot}`;

    } else if(context === 'Coin') {

      const result = await (<any>swal)({
        titleText: 'Take Gold From Stash',
        input: 'number',
        inputValue: 1,
        inputAttributes: {
          min: 0,
          max: this.character.gold
        },
        showCancelButton: true,
        cancelButtonText: 'Max',
        cancelButtonColor: '#3085d6',
        useRejections: false,
        preConfirm: (val) => {
          return new Promise((resolve, reject) => {
            if(val < 0) return reject('You do not have that much gold!');
            resolve();
          });
        }
      });

      if(result.dismiss) {
        if(result.dismiss === 'cancel') {
          args = '' + this.character.gold;
          this.sendRawCommand(cmd, args);
        }
      } else {
        args = '' + Math.round(Math.min(this.character.gold, result));
        this.sendRawCommand(cmd, args);
      }

      return;

    } else if(context === 'Merchant') {
      if(choiceStr === 'S' || choiceStr === 'B') {
        const result = await (<any>swal)({
          titleText: 'How Many Items?',
          input: 'number',
          inputValue: 1,
          inputAttributes: {
            min: 0
          },
          showCancelButton: true,
          cancelButtonText: 'Max',
          cancelButtonColor: '#3085d6',
          useRejections: false,
          preConfirm: (val) => {
            return new Promise((resolve, reject) => {
              if(val < 0) return reject('Invalid amount');
              resolve();
            });
          }
        });

        if(result.dismiss) {
          if(result.dismiss === 'cancel') {
            args = `${containerUUID} ${item.uuid} 500`;
            this.sendRawCommand(cmd, args);
          }
        } else {
          args = `${containerUUID} ${item.uuid} ${result}`;
          this.sendRawCommand(cmd, args);
        }

      } else {
        args = `${containerUUID} ${item.uuid} 1`;
        this.sendRawCommand(cmd, args);
      }
      return;
    }

    if(choiceStr === 'M' && this.showShop && includes(['Sack', 'Belt', 'Left', 'Right', 'Potion'], context)) {
      if(!args) {
        args = this.showShop.uuid;
      } else {
        args = `${args} ${this.showShop.uuid}`;
      }
    }

    if(context === 'Obtainagain') {
      args = `${this.showShop.uuid} ${contextSlot}`;
    }

    if(choiceStr === 'W') {
      args = `${args} ${this.showLocker[this.activeLockerNumber].lockerId}`;
    }

    if(context === 'Wardrobe') {
      args = `${contextSlot} ${this.showLocker[this.activeLockerNumber].lockerId}`;
    }

    this.sendRawCommand(cmd, `${args.trim()} ${postargs}`.trim());
  }

  public buildUseAction(item: Item, context: string, contextSlot?: string|number) {
    this.sendRawCommand('~use', `${context} ${contextSlot || -1} ${item.itemClass} ${item.uuid}`);
  }

  public hostilityLevelFor(compare: Character): 'hostile'|'neutral'|'friendly' {
    const me = this.character;

    if(compare.agro[me.uuid]
    || me.agro[compare.uuid]) return 'hostile';

    if(me.alignment === 'Good' && compare.alignment === 'Evil') return 'hostile';

    const hostility = (<NPC>compare).hostility;

    if(!hostility) return 'neutral';

    if(hostility === 'Never') return 'friendly';

    if(hostility === 'Faction') {
      if(compare.allegianceReputation[me.allegiance] < -100
      || me.allegianceReputation[compare.allegiance] < -100) return 'hostile';
    }

    if(hostility === 'Always') return 'hostile';

    return 'neutral';
  }

  public directionTo(char: Character) {
    if(!char) return '';

    const me = this.character;
    const diffX = char.x - me.x;
    const diffY = char.y - me.y;

    if(diffX < 0 && diffY > 0) return '↙';
    if(diffX > 0 && diffY < 0) return '↗';
    if(diffX > 0 && diffY > 0) return '↘';
    if(diffX < 0 && diffY < 0) return '↖';

    if(diffX > 0)              return '→';
    if(diffY > 0)              return '↓';

    if(diffX < 0)              return '←';
    if(diffY < 0)              return '↑';

    return '✧';
  }

  public distanceTo(char: Character): number {
    const me = this.character;
    return Math.floor(
      Math.sqrt(
        Math.pow(char.x - me.x, 2) +
        Math.pow(char.y - me.y, 2)
      )
    );
  }
}
