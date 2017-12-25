
import { Room } from 'colyseus';
import { LobbyState } from '../../shared/models/lobbystate';
import { Account } from '../../shared/models/account';
import { Player } from '../../shared/models/player';

import { CharacterCreator } from '../helpers/character-creator';

import { truncate, pick, includes } from 'lodash';

import { DB } from '../database';

import { JWTHelper } from '../helpers/jwt-helper';
import { ItemCreator } from '../helpers/item-creator';

export class Lobby extends Room<LobbyState> {

  auth0: any;

  private itemCreator: ItemCreator;

  onInit(opts) {

    this.setPatchRate(250);
    this.autoDispose = false;

    this.itemCreator = new ItemCreator();

    this.setState(new LobbyState({ accounts: [], messages: [], motd: '' }));

    this.loadSettings();
    DB.$players.update({}, { $set: { inGame: -1 } }, { multi: true });
  }

  private async getAccount(userId): Promise<Account> {
    return DB.$accounts.findOne({ userId })
      .then(data => {
        if(data) return new Account(data);
        return null;
      });
  }

  private updateAccount(account: Account) {
    // delete account._id;
    delete account.inGame;

    return DB.$accounts.update({ userId: account.userId }, { $set: account });
  }

  private async saveAccount(account: Account) {
    return DB.$accounts.insert(account);
  }

  private async createAccount({ userId, username }): Promise<Account> {
    const account: Account = new Account({ userId, username, createdAt: Date.now(), characterNames: [], maxCharacters: 4 });
    await this.saveAccount(account);
    return account;
  }

  private async tryLogin(client, { userId, username }) {

    const checkAccount = this.state.findAccount(userId);
    if(checkAccount) {
      this.send(client, {
        error: 'already_logged_in',
        prettyErrorName: 'Account Already Logged In',
        prettyErrorDesc: 'Please log out from other locations first.'
      });
      return;
    }

    let account = await this.getAccount(userId);

    if(!account) {
      if(!username) {
        this.send(client, { action: 'need_user_name' });
        return;

      } else {
        try {
          account = await this.createAccount({ userId, username });
        } catch(e) {
          this.send(client, {
            error: 'account_exists',
            prettyErrorName: 'Account Already Exists',
            prettyErrorDesc: 'Please choose a unique username.'
          });
        }
      }
    }

    if(!account || !account.username || !account.userId) return;

    client.userId = account.userId;
    client.username = account.username;

    account.colyseusId = client.id;
    this.updateAccount(account);

    this.state.addAccount(account);

    await DB.$players.update({ username: client.username }, { $set: { inGame: -1 } }, { multi: true });

    this.send(client, { action: 'set_account', account });
    this.send(client, { action: 'set_characters', characters: account.characterNames });
  }

  quit(client) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;
    account.inGame = -1;
  }

  private logout(client) {
    this.state.removeAccount(client.userId);
  }

  private sendMessage(client, message) {
    if(!client.username || !client.userId) return;
    message = truncate(message, { length: 500, omission: '[truncated]' });
    if(!message || !message.trim()) return;

    this.state.addMessage({ account: client.username, message });
  }

  private viewCharacter(client, data) {
    this.send(client, { action: 'set_character', character: CharacterCreator.getCustomizedCharacter(data) });
  }

  private async createCharacter(client, { charSlot, character }) {
    character = CharacterCreator.getCustomizedCharacter(character);

    const account = this.state.findAccount(client.userId);
    const oldPlayerName = account.characterNames[charSlot];
    if(oldPlayerName) {
      DB.$players.remove({ username: client.username, charSlot });
    }

    account.characterNames[charSlot] = character.name;
    this.updateAccount(account);
    account.inGame = -1;

    this.send(client, { action: 'set_account', account });

    const stats = pick(character, ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'luk', 'cha']);
    const name = character.name;
    const sex = character.sex;
    const gold = character.gold;
    const allegiance = character.allegiance;

    const player: Player = new Player({
      username: account.username,
      createdAt: Date.now(),
      charSlot,
      stats, sex, name, allegiance, gold,
      x: 14, y: 14, map: 'Tutorial',

      isGM: account.isGM
    });

    await CharacterCreator.giveCharacterBasicGearAndSkills(player, this.itemCreator);

    const savePlayer = player.toSaveObject();

    DB.$players.insert(savePlayer);
  }

  private getCharacter(username, charSlot) {
    return DB.$players.findOne({ username, charSlot, inGame: { $ne: true } });
  }

  private saveSettings() {
    DB.$lobbySettings.update({ lobby: 1 }, { $set: { motd: this.state.motd }}, { upsert: 1 });
  }

  private async loadSettings() {
    const settings = await DB.$lobbySettings.findOne({ lobby: 1 });

    if(settings) {
      this.state.motd = settings.motd;
    } else {
      DB.$lobbySettings.insert({ lobby: 1 });
    }

    return settings;
  }

  private async playCharacter(client, { charSlot }) {
    const account = this.state.findAccount(client.userId);
    if(account && account.inGame >= 0) {
      this.send(client, {
        error: 'already_in_game',
        prettyErrorName: 'Already In Game',
        prettyErrorDesc: 'You are already in game. If you actually are not in game, give this a few seconds or refresh the page.'
      });
      return;
    }

    const character = await this.getCharacter(client.username, charSlot);

    if(!character) {
      this.send(client, {
        error: 'no_character',
        prettyErrorName: 'No Character',
        prettyErrorDesc: 'There is no character in this slot (or it is already in-game). Please create one.'
      });
      return;
    }

    account.inGame = charSlot;

    this.send(client, { action: 'start_game', character });
  }

  onJoin(client, options) {
    this.send(client, { action: 'need_user_id' });
  }

  onLeave(client) {
    this.state.removeAccount(client.username);
    DB.$players.update({ username: client.username }, { $set: { inGame: -1 } }, { multi: true });
  }

  onMessage(client, data) {
    if(data.idToken && !JWTHelper.verifyToken(data.idToken)) {
      this.send(client, {
        error: 'error_invalid_token',
        prettyErrorName: 'Invalid Auth Token',
        prettyErrorDesc: 'Stop hacking.'
      });
      return;
    }

    if(data.action === 'heartbeat') return;
    if(data.action === 'status')    return this.changeStatus(client, data.status);
    if(data.action === 'alert')     return this.broadcastAlert(client, data);
    if(data.action === 'play')      return this.playCharacter(client, data);
    if(data.action === 'create')    return this.createCharacter(client, data);
    if(data.action === 'logout')    return this.logout(client);
    if(data.action === 'quit')      return this.quit(client);
    if(data.action === 'motd_set')  return this.setMOTD(client, data);
    if(data.userId && data.idToken) return this.tryLogin(client, data);
    if(data.message)                return this.sendMessage(client, data.message);
    if(data.characterCreator)       return this.viewCharacter(client, data);
  }

  broadcastMOTD() {
    this.state.addMessage({ account: '<System>', message: this.state.motd });
  }

  setMOTD(client, data) {
    const account = this.state.findAccount(client.userId);
    if(account && !account.isGM) return;

    this.state.motd = data.motd;
    if(this.state.motd) {
      this.broadcastMOTD();
    }
    this.saveSettings();
  }

  broadcastAlert(client, data) {
    const account = this.state.findAccount(client.userId);
    if(account && !account.isGM) return;

    this.broadcast({ action: 'alert', sender: account.username, message: data.message });
  }

  changeStatus(client, newStatus) {
    if(!includes(['Available', 'AFK'], newStatus)) return;

    const account = this.state.findAccount(client.userId);
    if(!account) return;

    account.status = newStatus;
    this.send(client, { action: 'set_account', account });
  }

  onDispose() {}

}
