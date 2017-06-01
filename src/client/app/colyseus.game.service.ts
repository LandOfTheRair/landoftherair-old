import { Injectable } from '@angular/core';
import { ClientGameState } from '../../models/clientgamestate';

import { find } from 'lodash';
import { Player } from '../../models/player';

@Injectable()
export class ColyseusGameService {

  client: any;
  colyseus: any;
  clientGameState: ClientGameState = new ClientGameState({});
  character: any;

  worldRoom: any;

  inGame: boolean;

  constructor() {}

  init(colyseus, client, character) {
    this.colyseus = colyseus;
    this.client = client;
    this.setCharacter(character);

    this.initGame();
  }

  private initGame() {
    if(!this.client) throw new Error('Client not intialized; cannot initialize game connection.');

    this.quit();

    this.worldRoom = this.client.join(this.character.map, { charSlot: this.character.charSlot });

    this.worldRoom.onUpdate.addOnce((state) => {
      state.players.forEach(p => this.clientGameState.addPlayer(p));
      this.clientGameState.map = state.map;
      this.clientGameState.mapName = this.character.map;
    });

    this.worldRoom.onUpdate.add((state) => {
      this.setCharacter(find(state.players, { username: this.colyseus.username }));
    });

    this.worldRoom.onData.add((data) => {
      console.log('data', data);
      this.interceptGameCommand(data);
    });

    this.worldRoom.state.listen('players/:id', 'add', (playerId: string, value: any) => {
      this.clientGameState.addPlayer(value);
    });

    this.worldRoom.state.listen('players/:id', 'remove', (playerId: string, value: any) => {
      this.clientGameState.removePlayer(value);
    });

    const locDirChange = (attribute: string, playerId: string, value: any) => {
      const player = this.clientGameState.players[playerId];
      player[attribute] = value;

      this.clientGameState.updateMyPlayer.emit(player);
    };

    this.worldRoom.state.listen('players/:id/x',    'replace', locDirChange.bind(this, 'x'));
    this.worldRoom.state.listen('players/:id/y',    'replace', locDirChange.bind(this, 'y'));
    this.worldRoom.state.listen('players/:id/dir',  'replace', locDirChange.bind(this, 'dir'));

    this.worldRoom.onJoin.add(() => {
      this.inGame = true;
    });

    this.worldRoom.onLeave.add(() => {
      this.inGame = false;
    });

    this.worldRoom.onError.add((e) => {
      alert(e);
    });
  }

  private setCharacter(character) {
    if(!character) return;
    this.character = new Player(character);
  }

  private interceptGameCommand({ action, error, ...other }) {
    if(error) {
      alert(error);
      return;
    }

    if(action === 'set_character')  return this.setCharacter(other.character);
  }

  private sendAction(data) {
    this.client.send(data);
  }

  public doMove(x, y) {
    this.sendAction({ command: 'move', x, y });
  }

  public quit() {
    if(!this.worldRoom) return;
    this.worldRoom.leave();
  }
}
