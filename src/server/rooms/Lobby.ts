
import { Room } from 'colyseus';
import { LobbyState } from '../../models/lobbystate';
import { Account } from '../../models/account';
import { Player } from '../../models/player';

import { CharacterCreator } from '../helpers/character-creator';

import { truncate, pick } from 'lodash';

import { DB } from '../database';

import * as jwt from 'jsonwebtoken';

const AUTH0_SECRET = process.env.AUTH0_SECRET;

export class Lobby extends Room<LobbyState> {

  constructor(opts) {
    super(opts);

    this.setPatchRate(1000 / 20);
    this.autoDispose = false;
    this.setState(new LobbyState({ accounts: [], messages: [] }));
  }

  private async getAccount(userId): Promise<Account> {
    return DB.$accounts.findOne({ userId })
      .then(data => {
        if(data) return new Account(data);
        return null;
      });
  }

  private updateAccount(account: Account) {
    delete account._id;

    return DB.$accounts.update({ userId: account.userId }, { $set: account });
  }

  private saveAccount(account: Account) {
    return DB.$accounts.update(account, { upsert: true });
  }

  private createAccount({ userId, username }): Account {
    const account: Account = new Account({ userId, username, createdAt: Date.now(), characterNames: [], maxCharacters: 4 });
    this.saveAccount(account);
    return account;
  }

  private async tryLogin(client, { userId, username }) {

    let account = await this.getAccount(userId);

    if(!account) {
      if(!username) {
        this.send(client, { action: 'need_user_name' });
        return;

      } else {
        account = this.createAccount({ userId, username });
      }
    }

    if(!account || !account.username || !account.userId) return;

    client.userId = account.userId;
    client.username = account.username;

    this.state.addAccount(account);
    this.send(client, { action: 'set_account', account });
  }

  private logout(client) {
    this.state.removeAccount(client.userId);
  }

  private verifyToken(token): boolean {
    try {
      jwt.verify(token, AUTH0_SECRET, { algorithms: ['HS256'] });
      return true;
    } catch(e) {
      return false;
    }
  }

  private sendMessage(client, message) {
    message = truncate(message, { length: 500, omission: '[truncated]' });
    if(!message || !message.trim()) return;

    this.state.addMessage({ account: client.username, message });
  }

  private viewCharacter(client, data) {
    this.send(client, { action: 'set_character', character: CharacterCreator.getCustomizedCharacter(data) });
  }

  private createCharacter(client, { charSlot, character }) {
    character = CharacterCreator.getCustomizedCharacter(character);

    const account = this.state.findAccount(client.userId);
    const oldPlayerName = account.characterNames[charSlot];
    if(oldPlayerName) {
      DB.$players.remove({ username: client.username, charSlot });
    }

    account.characterNames[charSlot] = character.name;
    this.updateAccount(account);

    this.send(client, { action: 'set_account', account });

    const stats = pick(character, ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'luk', 'cha']);
    const name = character.name;
    const gold = character.gold;
    const allegiance = character.allegiance;

    const player: Player = new Player({
      username: account.username,
      charSlot,
      stats, name, allegiance, gold,
      x: 10, y: 10, map: 'Tutorial'
    });

    DB.$players.insert(player);
  }

  onJoin(client, options) {
    this.send(client, { action: 'need_user_id' });
  }

  onLeave(client) {
    this.state.removeAccount(client.userId);
  }

  onMessage(client, data) {
    if(data.idToken && !this.verifyToken(data.idToken)) {
      this.send(client, { error: 'error_invalid_token' });
      return;
    }

    if(data.userId && data.idToken) return this.tryLogin(client, data);
    if(data.message)                return this.sendMessage(client, data.message);
    if(data.characterCreator)       return this.viewCharacter(client, data);
    if(data.action === 'create')    return this.createCharacter(client, data);
    if(data.action === 'logout')    return this.logout(client);
  }

  onDispose() {}

}
