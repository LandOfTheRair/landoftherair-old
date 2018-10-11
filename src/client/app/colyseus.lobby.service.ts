import { Injectable } from '@angular/core';

import * as swal from 'sweetalert2';

import { AuthService } from './auth.service';

import { LobbyState } from '../../shared/models/lobbystate';
import { Account, SilverPurchase } from '../../shared/models/account';

import { Subject, BehaviorSubject, interval } from 'rxjs';
import { merge, sortBy } from 'lodash';
import { AlertService } from './alert.service';

@Injectable()
export class ColyseusLobbyService {

  client: any;
  colyseus: any;
  room: any;
  lobbyState: LobbyState = new LobbyState({});
  myAccount: Account = new Account({});
  myCharacter: any = { name: '' };

  public myAccount$ = new BehaviorSubject<Account>(new Account({}));
  public tour$ = new BehaviorSubject<boolean>(false);
  public newMessages$ = new Subject<{ account: string, message: string }>();

  constructor(private auth: AuthService, private alert: AlertService) {}

  init(colyseus, client) {
    this.colyseus = colyseus;
    this.client = client;

    this.client.onOpen.add(() => {
      this.initLobby();
      this.startHeartbeat();
    });
  }

  private initLobby() {
    if(!this.client) throw new Error('Client not intialized; cannot initialize lobby connection.');

    this.client.getAvailableRooms('Lobby', (rooms, err) => {
      if(err) throw err;

      let roomId = 'Lobby';
      if(rooms && rooms.length > 0) roomId = (<any>sortBy(rooms, 'clients').reverse())[0].roomId;

      if(!roomId) roomId = 'Lobby';

      console.warn(`Room id list`, rooms, '; joining', roomId);

      this.room = this.client.join(roomId);

      this.room.onStateChange.add((state) => {
        this.lobbyState.syncTo(state);
        this.setAccount(this.lobbyState.findAccountByUsername(this.myAccount.username));
      });

      this.room.onMessage.add((data) => {
        this.interceptLobbyCommand(data);
      });

      this.room.onError.add((e) => {
        this.alert.alert({ title: 'Room Error', text: JSON.stringify(e), type: 'error' });
        console.error(e);
      });
    });
  }

  private loginThenEmit() {
    this.auth.login();
  }

  private emitUserId() {
    const userId = localStorage.getItem('user_id');
    const idToken = localStorage.getItem('id_token');
    const accessToken = localStorage.getItem('access_token');
    const username = localStorage.getItem('user_name');

    this.room.send({ userId, idToken, accessToken, username });
  }

  private async sendUserId() {
    await this.auth.isReady;

    const hasIdToken = localStorage.getItem('id_token');
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
    merge(this.myAccount, account);
    this.myAccount$.next(account);
  }

  private setCharacter(character) {
    this.myCharacter = character;
  }

  private interceptLobbyCommand({ action, error, ...other }) {
    // console.info('Colyseus:Lobby', action, error, other);

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
        type: other.popupType || 'error'
      }).then(() => {
        if(other.clearLoginData) {
          localStorage.removeItem('user_name');
          this.getUserName(true);
        }
      }).catch(() => {});

      return;
    }

    if(action === 'alert')          return this.popupAlert({ sender: other.sender, message: other.message });
    if(action === 'need_user_id')   return this.sendUserId();
    if(action === 'need_user_name') return this.getUserName();
    if(action === 'set_account')    return this.setAccount(other.account);
    if(action === 'set_character')  return this.setCharacter(other.character);
    if(action === 'start_game')     return this.startGame(other.character);
    if(action === 'force_logout')   return this.forceLogout();
    if(action === 'new_message')    return this.newMessage(other.account, other.message);
  }

  private newMessage(account: string, message: string) {
    this.newMessages$.next({ account, message });
  }

  public updateAccount() {
    this.room.send({ action: 'update_account' });
  }

  private forceLogout() {
    this.colyseus.game.quit();
    this.room.leave();
    this.quit();

    this.logout();
  }

  public logout() {
    this.room.send({ action: 'logout' });
    this.auth.logout();

    window.location.reload();
  }

  private startGame(character) {
    this.colyseus.initGame(character);
  }

  public sendMessage(message) {
    if(message.startsWith('/') && this.doCommand(message)) return;

    this.room.send({ message });
  }

  public getCharacterCreatorCharacter() {
    const opts = this.myCharacter;
    opts.characterCreator = true;
    this.room.send(opts);
  }

  public createCharacter(charSlot) {
    this.room.send({ action: 'create', charSlot, character: this.myCharacter });
  }

  public playCharacter(charSlot) {
    this.room.send({ action: 'play', charSlot });
  }

  public buySilverItem(key: SilverPurchase) {
    this.room.send({ action: 'purchase', item: key });
  }

  public buySilver(purchaseInfo) {
    this.room.send({ action: 'rmbuy', purchaseInfo });
  }

  public updateDiscordTag(newTag: string) {
    this.room.send({ action: 'discord_tag', newTag });
  }

  public updateDiscordOnline(isOnline: boolean) {
    this.room.send({ action: 'discord_online', isOnline });
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

    if(command === '/alert') {
      this.broadcastAlert(args);
      return true;
    }

    if(command === '/subscribe') {
      this.doSubscribe(args);
      return true;
    }

    if(command === '/unsubscribe') {
      this.doUnsubscribe(args);
      return true;
    }

    if(command === '/silver') {
      this.giveSilver(args);
      return true;
    }

    if(command === '/festival') {
      this.startFestival(args);
      return true;
    }

    if(command === '/mute') {
      this.mute(args);
      return true;
    }

    if(command === '/tester') {
      this.tester(args);
      return true;
    }

    if(command.startsWith('/')) {
      return true;
    }

    return false;
  }

  public tester(args) {
    this.room.send({ action: 'tester', args });
  }

  public mute(args) {
    this.room.send({ action: 'mute', args });
  }

  public startFestival(args) {
    this.room.send({ action: 'festival', args });
  }

  public giveSilver(args) {
    const silverGiven = +args.substring(0, args.indexOf(' '));
    const target = args.substring(args.indexOf(' ') + 1);

    if(isNaN(silverGiven) || !silverGiven || silverGiven < 0 || !target) return;

    this.room.send({ action: 'silver', account: target, silver: silverGiven });
  }

  public doSubscribe(args) {
    const subDays = +args.substring(0, args.indexOf(' '));
    const target = args.substring(args.indexOf(' ') + 1);

    if(isNaN(subDays) || !subDays || subDays < 0 || !target) return;

    this.room.send({ action: 'sub', account: target, period: subDays });
  }

  public doUnsubscribe(args) {
    this.room.send({ action: 'unsub', account: args });
  }

  public quit() {
    this.room.send({ action: 'quit' });
  }

  public setMOTD(newMOTD) {
    this.room.send({ action: 'motd_set', motd: newMOTD });
  }

  public resetMOTD() {
    this.room.send({ action: 'motd_set', motd: '' });
  }

  public broadcastAlert(message) {
    this.room.send({ action: 'alert', message });
  }

  public popupAlert({ sender, message }) {
    this.alert.alert({ title: `GM Alert from ${sender}`, text: message, type: 'info' });
  }

  public changeStatus(status) {
    this.room.send({ action: 'status', status });
  }

  public startHeartbeat() {
    const source = interval(20000);
    source.subscribe(() => {
      if(!this.room) return;
      this.room.send({ action: 'heartbeat' });
    });
  }
}
