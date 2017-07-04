import { Injectable } from '@angular/core';

import * as swal from 'sweetalert2';

import { AuthService } from './auth.service';

import { LobbyState } from '../../models/lobbystate';
import { Account } from '../../models/account';

@Injectable()
export class ColyseusLobbyService {

  client: any;
  colyseus: any;
  lobbyState: LobbyState = new LobbyState({});
  myAccount: Account = new Account({});
  myCharacter: any = { name: '' };

  constructor(private auth: AuthService) {}

  init(colyseus, client) {
    this.colyseus = colyseus;
    this.client = client;
    this.initLobby();
  }

  private initLobby() {
    if(!this.client) throw new Error('Client not intialized; cannot initialize lobby connection.');

    const room = this.client.join('Lobby');

    room.onUpdate.addOnce((state) => {
      this.lobbyState = new LobbyState(state);
      if(this.lobbyState.motd) {
        this.lobbyState.addMessage({ account: '<System>', message: this.lobbyState.motd });
      }
    });

    room.state.listen('messages/:id', 'add', (messageId: string, value: any) => {
      this.lobbyState.addMessage(value);
    });

    room.state.listen('accounts/:id', 'add', (accountId: string, value: any) => {
      this.lobbyState.addAccount(value);
    });

    room.state.listen('accounts/:id', 'remove', (accountId: string, value: any) => {
      console.log('value', value, accountId);
      this.lobbyState.removeAccountAtPosition(+accountId);
    });

    room.onData.add((data) => {
      this.interceptLobbyCommand(data);
    });
  }

  private loginThenEmit() {
    this.auth.login();
  }

  private emitUserId() {
    const userId = localStorage.getItem('user_id');
    const idToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('user_name');

    this.client.send({ userId, idToken, username });
  }

  private async sendUserId() {
    await this.auth.isReady;

    const hasIdToken = localStorage.getItem('access_token');
    const hasUserId = localStorage.getItem('user_id');

    if(hasUserId && hasIdToken) {
      this.emitUserId();
    } else if(hasIdToken) {
      this.emitUserId();
    } else {
      this.loginThenEmit();
    }
  }

  private getUserName(fromError = false) {
    let titleText = 'Enter your desired username.';
    if(fromError) {
      titleText = `${titleText} Your previous account id is already in use. Please choose another.`;
    }

    (<any>swal)({
      titleText,
      text: 'It must be between 2 and 20 characters.',
      input: 'text',
      type: fromError ? 'error' : null,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: (username) => {
        return new Promise((resolve, reject) => {
          if(username.length < 2 || username.length > 20) reject('Username is not the right size');
          resolve();
        });
      }
    }).then(username => {
      localStorage.setItem('user_name', username);
      this.sendUserId();
    }).catch(() => {});
  }

  private setAccount(account) {
    this.myAccount = account;
  }

  private setCharacter(character) {
    this.myCharacter = character;
  }

  private interceptLobbyCommand({ action, error, ...other }) {
    if(error) {

      if(error === 'error_invalid_token') {
        this.loginThenEmit();
        return;
      }

      if(error === 'account_exists') {
        this.getUserName(true);
        return;
      }

      (<any>swal)({
        titleText: other.prettyErrorName,
        text: other.prettyErrorDesc,
        type: 'error'
      });

      return;
    }

    if(action === 'need_user_id')   return this.sendUserId();
    if(action === 'need_user_name') return this.getUserName();
    if(action === 'set_account')    return this.setAccount(other.account);
    if(action === 'set_character')  return this.setCharacter(other.character);
    if(action === 'start_game')     return this.startGame(other.character);
  }

  private logout() {
    this.auth.logout();
    this.client.send({ action: 'logout' });

    window.location.reload();
  }

  private startGame(character) {
    this.colyseus.initGame(character);
  }

  public sendMessage(message) {
    if(message.startsWith('/') && this.doCommand(message)) return;

    this.client.send({ message });
  }

  public getCharacterCreatorCharacter() {
    const opts = this.myCharacter;
    opts.characterCreator = true;
    this.client.send(opts);
  }

  public createCharacter(charSlot) {
    this.client.send({ action: 'create', charSlot, character: this.myCharacter });
  }

  public playCharacter(charSlot) {
    this.client.send({ action: 'play', charSlot });
  }

  public doCommand(string): boolean {
    const command = string.split(' ')[0];
    const args = string.substring(string.indexOf(' ')).trim();

    if(command === '/motd') {
      this.setMOTD(args);
      return true;
    }

    if(command === '/resetmotd') {
      this.resetMOTD();
      return true;
    }

    return false;
  }

  public setMOTD(newMOTD) {
    this.client.send({ action: 'motd_set', motd: newMOTD });
  }

  public resetMOTD() {
    this.client.send({ action: 'motd_set', motd: '' });
  }
}
