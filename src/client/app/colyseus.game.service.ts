import { Injectable } from '@angular/core';
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
  character: any;

  worldRoom: any;

  _inGame: boolean;

  showGround: boolean;
  showTrainer: any = {};
  showShop: any = {};
  showBank: any = {};

  showLocker: Locker[] = [];
  activeLockerNumber: number;

  currentTarget: string;

  private changingMap: boolean;

  public currentCommand = '';

  public inGame$ = new Subject();
  public bgm$ = new Subject();
  public sfx$ = new Subject();

  public vfx$ = new Subject();

  private overrideNoBgm: boolean;
  private overrideNoSfx: boolean;

  constructor(private localStorage: LocalStorageService) {

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
    return this._inGame && this.worldRoom;
  }

  private initGame() {
    if (!this.client) throw new Error('Client not intialized; cannot initialize game connection.');

    this.quit();

    this.joinRoom(this.character.map);
  }

  private joinRoom(room) {
    if(this.worldRoom) {
      this.worldRoom.leave();
    }

    this.worldRoom = this.client.join(room, { charSlot: this.character.charSlot });

    this.worldRoom.onUpdate.addOnce((state) => {
      this.clientGameState.mapName = state.mapName;
      this.clientGameState.grabOldUpdates(state.mapData);

      this.changingMap = false;
    });

    this.worldRoom.onUpdate.add((state) => {
      this.clientGameState.setGroundItems(state.groundItems);
      this.clientGameState.setMapData(state.mapData);
      this.clientGameState.setMapNPCs(state.mapNPCs);
      this.clientGameState.setPlayers(state.players);
      this.clientGameState.setEnvironmentalObjects(state.environmentalObjects);
      this.setCharacter(find(state.players, { username: this.colyseus.username }));
    });

    this.worldRoom.onData.add((data) => {
      this.interceptGameCommand(data);
    });

    const updateSpecificAttr = (attr, entityId, value) => {
      this.clientGameState.updatePlayer(entityId, attr, value);
    };

    const updateAgro = (entityId, player, value) => {
      this.clientGameState.updatePlayerAgro(entityId, player, value);
    };

    const updateHP = (entityId, key, value) => {
      this.clientGameState.updatePlayerHP(entityId, key, value);
    };

    const updateHand = (hand, entityId, value) => {
      this.clientGameState.updatePlayerHand(entityId, hand, value);
    };

    const updateHandItem = (hand, entityId, attr, value) => {
      this.clientGameState.updatePlayerHandItem(entityId, hand, attr, value);
    };

    const updateGearItem = (slot, entityId, value) => {
      this.clientGameState.updatePlayerGearItem(entityId, slot, value);
    };

    this.worldRoom.state.listen('players/:id/x', 'replace', updateSpecificAttr.bind(this, 'x'));
    this.worldRoom.state.listen('players/:id/y', 'replace', updateSpecificAttr.bind(this, 'y'));
    this.worldRoom.state.listen('players/:id/dir', 'replace', updateSpecificAttr.bind(this, 'dir'));
    this.worldRoom.state.listen('players/:id/swimLevel', 'replace', updateSpecificAttr.bind(this, 'swimLevel'));

    this.worldRoom.state.listen('players/:id/agro/:player', 'add', updateAgro);
    this.worldRoom.state.listen('players/:id/agro/:player', 'replace', updateAgro);
    this.worldRoom.state.listen('players/:id/agro/:player', 'remove', updateAgro);

    this.worldRoom.state.listen('players/:id/hp/:key', 'replace', updateHP);
    this.worldRoom.state.listen('players/:id/hp/:key', 'replace', updateHP);

    this.worldRoom.state.listen('players/:id/leftHand', 'replace', updateHand.bind(this, 'leftHand'));
    this.worldRoom.state.listen('players/:id/rightHand', 'replace', updateHand.bind(this, 'rightHand'));

    this.worldRoom.state.listen('players/:id/gear/Armor', 'replace', updateGearItem.bind(this, 'Armor'));
    this.worldRoom.state.listen('players/:id/gear/Robe1', 'replace', updateGearItem.bind(this, 'Robe1'));
    this.worldRoom.state.listen('players/:id/gear/Robe2', 'replace', updateGearItem.bind(this, 'Robe2'));

    this.worldRoom.state.listen('players/:id/leftHand/:attr', 'add', updateHandItem.bind(this, 'leftHand'));
    this.worldRoom.state.listen('players/:id/rightHand/:attr', 'add', updateHandItem.bind(this, 'rightHand'));

    this.worldRoom.state.listen('players/:id/leftHand/:attr', 'replace', updateHandItem.bind(this, 'leftHand'));
    this.worldRoom.state.listen('players/:id/rightHand/:attr', 'replace', updateHandItem.bind(this, 'rightHand'));

    this.worldRoom.state.listen('players/:id/effects/:effect', 'add', (entityId, effect, value) => {
      this.clientGameState.updatePlayerEffect(entityId, effect, value);
    });

    this.worldRoom.state.listen('players/:id/effects/:effect/duration', 'replace', (entityId, effect, value) => {
      this.clientGameState.updatePlayerEffectDuration(entityId, effect, value);
    });

    this.worldRoom.state.listen('players/:id/effects/:effect', 'remove', (entityId, effect) => {
      this.clientGameState.updatePlayerEffect(entityId, effect, null);
    });

    this.worldRoom.state.listen('players/:id/totalStats/stealth', 'replace', (entityId, value) => {
      this.clientGameState.updatePlayerStealth(entityId, value);
    });

    this.worldRoom.state.listen('players/:id/totalStats/perception', 'replace', (entityId, value) => {
      this.clientGameState.updatePlayerPerception(entityId, value);
    });

    const updateDoor = (doorId) => {
      this.clientGameState.updates.openDoors.push(doorId);
    };

    this.worldRoom.state.listen('mapData/openDoors/:id', 'add', updateDoor);
    this.worldRoom.state.listen('mapData/openDoors/:id/isOpen', 'replace', updateDoor);

    this.worldRoom.onJoin.add(() => {
      this.inGame$.next(true);
      this._inGame = true;
    });

    this.worldRoom.onLeave.add(() => {
      this.clientGameState.removeAllPlayers();
      if(this.changingMap) return;
      this.inGame$.next(false);
      this._inGame = false;
    });

    this.worldRoom.onError.add((e) => {
      alert(e);
    });
  }

  private setCharacter(character) {
    if(!character) return;
    this.character = new Player(character);

    // update fov
    if(this.character.$fov) {
      this.setFOV(this.character.$fov);
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
    this.clientGameState.playerBoxes$.next(this.character);
  }

  private setFOV(fov) {
    this.clientGameState.setFOV(fov);
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

    if(other.target)                this.setTarget(other.target);
    if(action === 'draw_effect_r')  return this.drawEffectRadius(other);
    if(action === 'set_map')        return this.setMap(other.map);
    if(action === 'update_locker')  return this.updateLocker(other.locker);
    if(action === 'show_lockers')   return this.showLockerWindow(other.lockers, other.lockerId);
    if(action === 'show_bank')      return this.showBankWindow(other.uuid, other.bankId);
    if(action === 'show_shop')      return this.showShopWindow(other.vendorItems, other.uuid);
    if(action === 'show_trainer')   return this.showTrainerWindow(other.classTrain, other.trainSkills, other.uuid);
    if(action === 'show_ground')    return this.showGroundWindow();
    if(action === 'change_map')     return this.changeMap(other.map);
    if(action === 'log_message')    return this.logMessage(other);
    if(action === 'set_character')  return this.setCharacter(other.character);
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
    this.client.send(data);
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

  public sendCommandString(str: string, target?: string) {
    str.split(';').forEach(cmd => {
      cmd = cmd.trim();

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
  }

  public doMove(x, y) {
    this.sendAction({ command: '~move', x, y });
    this.unshowWindows();
  }

  public doInteract(x, y) {
    this.sendAction({ command: '~interact', x, y });
  }

  public quit() {
    this.unshowWindows();
    this.clientGameState.reset();

    if(!this.worldRoom) return;
    this.worldRoom.leave();
    delete this.worldRoom;

    if(this.colyseus && this.colyseus.lobby) {
      this.colyseus.lobby.quit();
    }
  }

  public buildDropAction({ dragData }, choice) {
    const { context, contextSlot, count, containerUUID, item } = dragData;
    if(context.substring(0, 1) === choice.substring(0, 1)) return;
    this.buildAction(item, { context, contextSlot, count, containerUUID }, choice.substring(0, 1));
  }

  public async buildAction(item, { context, contextSlot, count, containerUUID }, choice) {
    const cmd = `~${context.substring(0, 1)}t${choice}`;

    let args = '';

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
      if(choice === 'S' || choice === 'B') {
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

    if(choice === 'M' && this.showShop && includes(['Sack', 'Belt', 'Left', 'Right', 'Potion'], context)) {
      if(!args) {
        args = this.showShop.uuid;
      } else {
        args = `${args} ${this.showShop.uuid}`;
      }
    }

    if(context === 'Obtainagain') {
      args = `${this.showShop.uuid} ${contextSlot}`;
    }

    if(choice === 'W') {
      args = `${args} ${this.showLocker[this.activeLockerNumber].lockerId}`;
    }

    if(context === 'Wardrobe') {
      args = `${contextSlot} ${this.showLocker[this.activeLockerNumber].lockerId}`;
    }

    this.sendRawCommand(cmd, args.trim());
  }

  public buildUseAction(item: Item, context: string, contextSlot: string|number) {
    this.sendRawCommand('~use', `${context} ${contextSlot || -1} ${item.itemClass} ${item.uuid}`);
  }

  public hostilityLevelFor(compare: Character): 'hostile'|'neutral'|'friendly' {
    const me = this.character;

    if(compare.agro[me.uuid]
    || me.agro[compare.uuid]) return 'hostile';

    const hostility = (<NPC>compare).hostility;

    if(!hostility) return 'neutral';

    if(hostility === 'Never') return 'friendly';

    if(hostility === 'Always'
    || compare.allegianceReputation[me.allegiance] <= 0) return 'hostile';

    return 'neutral';
  }

  public directionTo(char: Character) {
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
