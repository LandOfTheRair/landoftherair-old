import { Injectable } from '@angular/core';
import { ClientGameState } from './clientgamestate';

import { find, includes } from 'lodash';
import { Player } from '../../models/player';

@Injectable()
export class ColyseusGameService {

  client: any;
  colyseus: any;
  clientGameState: ClientGameState = new ClientGameState({});
  character: any;

  worldRoom: any;

  _inGame: boolean;

  constructor() {}

  init(colyseus, client, character) {
    this.colyseus = colyseus;
    this.client = client;
    this.setCharacter(character);

    this.initGame();
  }

  get inGame() {
    return this._inGame && this.worldRoom;
  }

  private initGame() {
    if(!this.client) throw new Error('Client not intialized; cannot initialize game connection.');

    this.quit();

    this.worldRoom = this.client.join(this.character.map, { charSlot: this.character.charSlot });

    this.worldRoom.onUpdate.addOnce((state) => {
      this.clientGameState.mapName = state.mapName;
      this.clientGameState.setMapData(state.mapData);
      this.clientGameState.setMap(state.map);

      state.players.forEach(p => {
        this.clientGameState.addPlayer(p);
      });
    });

    this.worldRoom.onUpdate.add((state) => {
      this.clientGameState.setMapData(state.mapData);
      this.setCharacter(find(state.players, { username: this.colyseus.username }));
    });

    this.worldRoom.onData.add((data) => {
      this.interceptGameCommand(data);
    });

    this.worldRoom.state.listen('players/:id', 'add', (playerId: string, value: any) => {
      this.clientGameState.addPlayer(value);
    });

    this.worldRoom.state.listen('players/:id', 'remove', (playerId: string|number) => {
      this.clientGameState.removePlayer(+playerId);
    });

    const locDirChange = (attribute: string, playerId: string|number, value: any) => {
      this.clientGameState.updatePlayer(+playerId, attribute, value);
    };

    this.worldRoom.state.listen('players/:id/x',          'replace', locDirChange.bind(this, 'x'));
    this.worldRoom.state.listen('players/:id/y',          'replace', locDirChange.bind(this, 'y'));
    this.worldRoom.state.listen('players/:id/dir',        'replace', locDirChange.bind(this, 'dir'));
    this.worldRoom.state.listen('players/:id/swimLevel',  'replace', locDirChange.bind(this, 'swimLevel'));

    const updateDoor = (doorId) => {
      this.clientGameState.updates.openDoors.push(doorId);
    };

    this.worldRoom.state.listen('mapData/openDoors/:id', 'add', updateDoor);
    this.worldRoom.state.listen('mapData/openDoors/:id/isOpen', 'replace', updateDoor);

    this.worldRoom.onJoin.add(() => {
      this._inGame = true;
    });

    this.worldRoom.onLeave.add(() => {
      this._inGame = false;
    });

    this.worldRoom.onError.add((e) => {
      alert(e);
    });
  }

  private setCharacter(character) {
    if(!character) return;
    this.character = new Player(character);

    if(this.character.$fov) {
      this.setFOV(this.character.$fov);
    }

    this.clientGameState.playerBoxes$.next(this.character);
  }

  private setFOV(fov) {
    this.clientGameState.setFOV(fov);
  }

  private logMessage({ message }: any) {
    this.clientGameState.addLogMessage(message);
  }

  private interceptGameCommand({ action, error, ...other }) {
    if(error) {
      alert(error);
      return;
    }

    if(action === 'log_message')    return this.logMessage(other);
    if(action === 'set_character')  return this.setCharacter(other.character);
  }

  private sendAction(data) {
    this.client.send(data);
  }

  private sendCommandString(str: string) {
    let command = '';
    let args = '';

    if(includes(str, ',')) {
      command = '~talk';
      args = str;
    } else {
      const arr = str.split(' ');
      command = arr[0];
      args = arr.length > 1 ? str.substring(str.indexOf(' ')).trim() : '';
    }

    this.sendAction({ command, args });
  }

  public doMove(x, y) {
    this.sendAction({ command: '~move', x, y });
  }

  public doInteract(x, y) {
    this.sendAction({ command: '~interact', x, y });
  }

  public quit() {
    if(!this.worldRoom) return;
    this.worldRoom.leave();
    delete this.worldRoom;
  }
}
