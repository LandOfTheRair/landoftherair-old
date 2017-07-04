
import { Room } from 'colyseus';
import { LobbyState } from '../../models/lobbystate';
import { Account } from '../../models/account';
import { Player } from '../../models/player';

import { CharacterCreator } from '../helpers/character-creator';

import { truncate, pick, sampleSize } from 'lodash';

import { DB } from '../database';

import * as jwt from 'jsonwebtoken';
import { ItemCreator } from '../helpers/item-creator';
import { SkillClassNames } from '../../models/character';

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

  private async saveAccount(account: Account) {
    return DB.$accounts.insert(account);
  }

  private async createAccount({ userId, username }): Promise<Account> {
    const account: Account = new Account({ userId, username, createdAt: Date.now(), characterNames: [], maxCharacters: 4 });
    await this.saveAccount(account);
    return account;
  }

  private async tryLogin(client, { userId, username }) {

    // TODO check if account logged in, if so, fail here

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

    await this.giveCharacterBasicGearAndSkills(player);

    DB.$players.insert(player);
  }

  private async giveCharacterBasicGearAndSkills(player: Player) {
    let skill2 = '';
    sampleSize([
      SkillClassNames.OneHanded, SkillClassNames.TwoHanded, SkillClassNames.Shortsword,
      SkillClassNames.Staff, SkillClassNames.Dagger, SkillClassNames.Mace, SkillClassNames.Axe
    ], 4).forEach(skill => {
      player._gainSkill(skill, player.calcSkillXP(1));
    });

    let body = '';
    let mainhand = '';

    switch(player.allegiance) {
      case 'None': {
        mainhand = 'Antanian Dagger';
        body = 'Antanian Studded Tunic';
        skill2 = SkillClassNames.Dagger;
        break;
      }

      case 'Pirates': {
        mainhand = 'Antanian Axe';
        body = 'Antanian Tunic';
        skill2 = SkillClassNames.Axe;
        break;
      }

      case 'Townsfolk': {
        mainhand = 'Antanian Greatsword';
        body = 'Antanian Ringmail Tunic';
        skill2 = SkillClassNames.TwoHanded;
        break;
      }

      case 'Royalty': {
        mainhand = 'Antanian Mace';
        body = 'Antanian Tunic';
        skill2 = SkillClassNames.Mace;
        break;

      }

      case 'Adventurers': {
        mainhand = 'Antanian Longsword';
        body = 'Antanian Studded Tunic';
        skill2 = SkillClassNames.OneHanded;
        break;

      }

      case 'Wilderness': {
        mainhand = 'Antanian Staff';
        body = 'Antanian Studded Tunic';
        skill2 = SkillClassNames.Staff;
        break;

      }

      case 'Underground': {
        mainhand = 'Antanian Shortsword';
        body = 'Antanian Tunic';
        skill2 = SkillClassNames.Shortsword;
        break;
      }
    }

    player.gear.Armor = await ItemCreator.getItemByName(body);
    player.rightHand = await ItemCreator.getItemByName(mainhand);
    player._gainSkill(skill2, player.calcSkillXP(2));

  }

  private getCharacter(username, charSlot) {
    return DB.$players.findOne({ username, charSlot });
  }

  private async playCharacter(client, { charSlot }) {
    const character = await this.getCharacter(client.username, charSlot);

    if(!character) {
      this.send(client, {
        error: 'no_character',
        prettyErrorName: 'No Character',
        prettyErrorDesc: 'There is no character in this slot. Please create one.'
      });
      return;
    }

    // TODO set in game flag, check, fail if necessary

    this.send(client, { action: 'start_game', character });
  }

  onJoin(client, options) {
    this.send(client, { action: 'need_user_id' });
  }

  onLeave(client) {
    this.state.removeAccount(client.username);
  }

  onMessage(client, data) {
    if(data.idToken && !this.verifyToken(data.idToken)) {
      this.send(client, {
        error: 'error_invalid_token',
        prettyErrorName: 'Invalid Auth Token',
        prettyErrorDesc: 'Stop hacking.'
      });
      return;
    }

    if(data.userId && data.idToken) return this.tryLogin(client, data);
    if(data.message)                return this.sendMessage(client, data.message);
    if(data.characterCreator)       return this.viewCharacter(client, data);
    if(data.action === 'play')      return this.playCharacter(client, data);
    if(data.action === 'create')    return this.createCharacter(client, data);
    if(data.action === 'logout')    return this.logout(client);
  }

  onDispose() {}

}
