import { Injectable } from '@angular/core';
import { ClientGameState } from '../../models/clientgamestate';

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

    this.worldRoom = this.client.join(this.character.map);

    this.worldRoom.onUpdate.addOnce((state) => {
      this.clientGameState.map = state.map;
      this.clientGameState.players = state.players;
      this.clientGameState.mapName = this.character.map;
    });

    this.worldRoom.onData.add((data) => {
      console.log(data);
      this.interceptGameCommand(data);
    });

    this.worldRoom.onJoin.add(() => {
      this.inGame = true;
    });

    this.worldRoom.onLeave.add(() => {
      this.inGame = false;
    });
  }

  private setCharacter(character) {
    this.character = character;
  }

  private interceptGameCommand({ action, error, ...other }) {
    if(error) {
      alert(error);
      return;
    }

    if(action === 'set_character')  return this.setCharacter(other.character);
  }

  public quit() {
    if(!this.worldRoom) return;
    this.worldRoom.leave();
  }

  public sendMessage(message) {
    this.client.send({ message });
  }
}
