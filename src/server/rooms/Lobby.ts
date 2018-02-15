
import * as Discord from 'discord.js';

import { Room } from 'colyseus';
import { LobbyState } from '../../shared/models/lobbystate';
import { Account } from '../../shared/models/account';
import { Player } from '../../shared/models/player';

import { CharacterCreator } from '../helpers/character-creator';

import { truncate, pick, includes, find } from 'lodash';

import { DB } from '../database';

import { JWTHelper } from '../helpers/jwt-helper';
import { ItemCreator } from '../helpers/item-creator';
import { PartyArbiter } from '../helpers/party-arbiter';
import { AccountHelper } from '../helpers/account-helper';
import { AllSilverPurchases, SubscriptionHelper } from '../helpers/subscription-helper';
import { Logger } from '../logger';
import { BonusArbiter } from '../helpers/bonus-arbiter';
import { MessageHelper } from '../helpers/message-helper';

const DISCORD_WATCHER_ROLE_NAME = process.env.DISCORD_WATCHER_ROLE || 'Event Watcher';
const DISCORD_BOT_NAME = process.env.DISCORD_BOT_NAME || 'LandOfTheRairLobby';

export class Lobby extends Room<LobbyState> {

  auth0: any;

  private itemCreator: ItemCreator;
  private partyArbiter: PartyArbiter;
  private bonusArbiter: BonusArbiter;

  private discord: Discord.Client;
  private discordGuild: Discord.Guild;
  private discordChannel: Discord.GroupDMChannel;
  private discordBotChannel: Discord.GroupDMChannel;

  onInit(opts) {

    this.setPatchRate(250);
    this.autoDispose = false;

    this.itemCreator = new ItemCreator();
    this.partyArbiter = new PartyArbiter();
    this.bonusArbiter = new BonusArbiter(this);

    this.setState(new LobbyState({ accounts: [], messages: [], motd: '' }));

    this.loadSettings();
    DB.$players.update({}, { $set: { inGame: -1 } }, { multi: true });

    this.state.silverPurchases = AllSilverPurchases;

    this.startDiscord();
  }

  private async createAccount({ userId, username }): Promise<Account> {
    const account: Account = new Account({ userId, username, createdAt: Date.now(), characterNames: [], maxCharacters: 4 });
    await AccountHelper.createAccount(account);
    return account;
  }

  private async tryLogin(client, { userId, username }) {

    const checkAccount = this.state.findAccount(userId);
    if(checkAccount) {
      this.removeUsername(username);

      const oldClient = find(this.clients, { userId });
      if(oldClient) {
        this.send(oldClient, {
          error: 'someone_kicked_you',
          prettyErrorName: 'Someone Kicked You',
          prettyErrorDesc: 'You have been forcibly logged out from this location.'
        });

        this.send(oldClient, { action: 'force_logout' });

      }

    }

    let account = await AccountHelper.getAccountById(userId);

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

    await SubscriptionHelper.checkAccountForExpiration(account);

    client.userId = account.userId;
    client.username = account.username;

    account.colyseusId = client.id;
    AccountHelper.saveAccount(account);

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

    this.addMessage({ account: client.username, message }, 'player');
  }

  private fixTextMessage(message: string): string {
    return truncate(message, { length: 500, omission: '[truncated]' }).trim();
  }

  private addMessage({ account, message }, source: 'player'|'discord') {
    message = this.fixTextMessage(message);
    if(!message) return;

    this.state.addMessage({ account, message });

    if(source !== 'discord') {
      this.sendDiscordMessage(account, message);
    }
  }

  private viewCharacter(client, data) {
    this.send(client, { action: 'set_character', character: CharacterCreator.getCustomizedCharacter(data) });
  }

  private async createCharacter(client, { charSlot, character }) {
    character = CharacterCreator.getCustomizedCharacter(character);

    const account = this.state.findAccount(client.userId);
    if(!account) return;

    charSlot = Math.round(+charSlot);
    if(charSlot < 0 || charSlot > account.maxCharacters) {
      this.send(client, {
        error: 'invalid_char_slot',
        prettyErrorName: 'Invalid Character Slot',
        prettyErrorDesc: 'That character slot is not valid for character creation. Try again!'
      });
      return;
    }

    const oldPlayerName = account.characterNames[charSlot];
    if(oldPlayerName) {
      DB.$players.remove({ username: client.username, charSlot });
    }

    account.characterNames[charSlot] = character.name;
    AccountHelper.saveAccount(account);
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
      x: 14, y: 14, map: 'Tutorial'
    });

    await CharacterCreator.giveCharacterBasicGearAndSkills(player, this.itemCreator);

    const savePlayer = player.toSaveObject();

    DB.$players.insert(savePlayer);
  }

  private getCharacter(username, charSlot) {
    return DB.$players.findOne({ username, charSlot, inGame: { $ne: true } });
  }

  public saveSettings() {
    DB.$lobbySettings.update({ lobby: 1 }, { $set: {
      motd: this.state.motd,
      bonus: this.bonusArbiter.allBonusData,
      bonusHours: this.bonusArbiter.boughtBonusHours
    }}, { upsert: 1 });
  }

  private async loadSettings() {
    const settings = await DB.$lobbySettings.findOne({ lobby: 1 });

    if(settings) {
      this.state.motd = settings.motd || '';
      if(settings.bonus) this.bonusArbiter.manuallyUpdateBonusSettings(settings.bonus);
      if(settings.bonusHours) this.bonusArbiter.manuallyUpdateBonusHours(settings.bonusHours);
    } else {
      DB.$lobbySettings.insert({ lobby: 1 });
    }

    return settings;
  }

  private async playCharacter(client, { charSlot }) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

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
    this.removeUsername(client.username);
  }

  removeUsername(username) {
    this.state.removeAccount(username);
    DB.$players.update({ username }, { $set: { inGame: -1 } }, { multi: true });
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
    if(data.action === 'sub')       return this.handleSubscription(client, data);
    if(data.action === 'unsub')     return this.handleUnsubscription(client, data);
    if(data.action === 'silver')    return this.giveSilver(client, data);
    if(data.action === 'purchase')  return this.purchase(client, data.item);
    if(data.action === 'festival')  return this.adjustFestival(client, data.args);
    if(data.userId && data.idToken) return this.tryLogin(client, data);
    if(data.message)                return this.sendMessage(client, data.message);
    if(data.characterCreator)       return this.viewCharacter(client, data);
  }

  private adjustFestival(client, args: string) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const festivalData = MessageHelper.getMergeObjectFromArgs(args);
    const resultFestivalData = this.bonusArbiter.manuallyUpdateBonusSettings(festivalData);

    const keys = Object.keys(resultFestivalData);
    if(keys.length === 0) return;

    const festivalStr = keys.map(key => `${key}=${resultFestivalData[key]}`).join(', ');
    const message = `GM ${gmAccount.username} has changed the following global game settings: ${festivalStr}`;

    this.addSystemMessage(message);
    this.sendDiscordEventNotification(message);
    this.saveSettings();
  }

  private async purchase(client, key) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    const wasSuccess = await SubscriptionHelper.purchaseWithSilver(account, key, this);
    if(!wasSuccess) {
      this.send(client, {
        error: 'couldnt_purchase',
        prettyErrorName: 'Purchase Failed',
        prettyErrorDesc: 'The purchase didn\'t go through. Either you don\'t have enough silver, or something else went wrong. If this problem persists, contact a GM..'
      });
    }
  }

  public updateFestivalTime(account: Account, key: 'xpMult'|'skillMult'|'traitGainMult'|'goldMult', hours = 6): void {

    this.bonusArbiter.manuallyUpdateBonusHours({ [key]: hours });
    this.saveSettings();

    const hoursRemaining = this.bonusArbiter.boughtBonusHours[key];

    this.sendDiscordEventNotification(`${account.username} just bought ${hours} hours of ${key} +100%! There are ${hoursRemaining} hours left of the bonus.`);
  }

  private async giveSilver(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const { account, silver } = data;
    if(!account || !silver) return;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    SubscriptionHelper.giveSilver(targetAccount, silver);
  }

  private async handleSubscription(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    let { account, period } = data;

    if(!account) return;
    if(!period) period = 30;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    SubscriptionHelper.startTrial(targetAccount, period);
  }

  private handleUnsubscription(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const { account } = data;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    SubscriptionHelper.unsubscribe(targetAccount);
  }

  private addSystemMessage(message: string) {
    this.state.addMessage({ account: '<System>', message });
  }

  private broadcastMOTD() {
    this.addSystemMessage(this.state.motd);
  }

  private setMOTD(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    this.state.motd = data.motd;
    if(this.state.motd) {
      this.broadcastMOTD();
    }
    this.saveSettings();
  }

  private broadcastAlert(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    this.broadcast({ action: 'alert', sender: gmAccount.username, message: data.message });
  }

  private changeStatus(client, newStatus) {
    if(!includes(['Available', 'AFK'], newStatus)) return;

    const account = this.state.findAccount(client.userId);
    if(!account) return;

    account.status = newStatus;
    this.send(client, { action: 'set_account', account });
  }

  onDispose() {}

  // discord is optional
  private async startDiscord() {
    if(!process.env.DISCORD_SECRET) return;

    this.discord = new Discord.Client();

    try {
      await this.discord.login(process.env.DISCORD_SECRET);
      this.discordGuild = this.discord.guilds.get(process.env.DISCORD_GUILD);
      this.discordChannel = <Discord.GroupDMChannel>this.discord.channels.get(process.env.DISCORD_CHANNEL);
      this.discordBotChannel = <Discord.GroupDMChannel>this.discord.channels.get(process.env.DISCORD_BOT_CHANNEL);
      this.state.discordConnected = true;
    } catch(e) {
      Logger.error(e);
      return;
    }

    this.discord.on('message', ({ content, channel, author, member }) => {
      if(channel.id === this.discordChannel.id) this.parseLobbyMessage({ content, author });
      if(channel.id === this.discordBotChannel.id) this.parseBotMessage({ content, channel, member });
    });

  }

  private parseBotMessage({ content, channel, member }) {
    if(content !== '!events') return;

    // too lazy to do a permissions check
    try {
      const watcherRole = this.discordGuild.roles.find('name', DISCORD_WATCHER_ROLE_NAME);
      const hasRole = member.roles.get(watcherRole.id);

      if(hasRole) {
        member.removeRole(watcherRole);
        channel.send(`${member}, you are **no longer watching** events. You will no longer receive event notifications.`)
      } else {
        member.addRole(watcherRole);
        channel.send(`${member}, you are assigned the role ${DISCORD_WATCHER_ROLE_NAME}. You will be notified when something cool happens.`);
      }

    } catch(e) {
      console.error(e);
    }
  }

  private parseLobbyMessage({ content, author }) {
    if(author.username === DISCORD_BOT_NAME) return;

    this.addMessage({ message: content, account: `ᐎ${author.username}` }, 'discord');
  }

  private sendDiscordMessage(username: string, message: string) {
    if(!this.discordChannel) return;
    this.discordChannel.send(`${username}: ${message}`);
  }

  private sendDiscordEventNotification(message: string) {
    if(!this.discordChannel) return;

    const role = this.discordGuild.roles.find('name', DISCORD_WATCHER_ROLE_NAME);
    this.discordChannel.send(`${role}, ${message}`);
  }
}
