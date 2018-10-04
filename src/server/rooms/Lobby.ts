
import { Room } from 'colyseus';
import { LobbyState } from '../../shared/models/lobbystate';
import { Account } from '../../shared/models/account';
import { Player } from '../../shared/models/player';

import { Redis } from '../redis';
import { CharacterCreator } from '../helpers/character/character-creator';

import { truncate, pick, includes, find } from 'lodash';

import { DB } from '../database';

import { JWTHelper } from '../helpers/account/jwt-helper';
import { ItemCreator } from '../helpers/world/item-creator';
import { PartyArbiter } from '../helpers/party/party-arbiter';
import { AccountHelper } from '../helpers/account/account-helper';
import { AllSilverPurchases, SilverBuyTiers, SubscriptionHelper } from '../helpers/account/subscription-helper';
import { BonusArbiter } from '../helpers/bonus/bonus-arbiter';
import { MessageHelper } from '../helpers/world/message-helper';
import { DiscordHelper } from '../helpers/lobby/discord-helper';
import { PouchHelper } from '../helpers/character/pouch-helper';
import { TeleportHelper } from '../helpers/world/teleport-helper';
import { DateTime } from 'luxon';

const CHAT_SPAM_DELAY = 1000;
const MAX_SPAM_MESSAGES = 5;

export class Lobby extends Room<LobbyState> {

  auth0: any;

  private itemCreator: ItemCreator;
  private partyArbiter: PartyArbiter;
  private bonusArbiter: BonusArbiter;
  private subscriptionHelper: SubscriptionHelper;

  private userIdsLoggingIn: any = {};

  private redis: Redis;
  public get redisClient() {
    return this.redis.client;
  }

  private resetTime: DateTime;
  private hasAlertedOfReset: boolean[] = [];

  async onInit(opts) {
    this.redis = new Redis();
    this.flagResetTime();

    this.setPatchRate(250);
    this.setSimulationInterval(this.tick.bind(this), 1000);
    this.autoDispose = false;

    this.itemCreator = new ItemCreator();
    this.partyArbiter = new PartyArbiter(this);
    this.bonusArbiter = new BonusArbiter(this);
    this.subscriptionHelper = new SubscriptionHelper();

    this.setState(new LobbyState({ accounts: [], messages: [], motd: '' }));

    this.loadSettings();
    DB.$players.update({}, { $set: { inGame: -1 } }, { multi: true });

    this.state.silverPurchases = AllSilverPurchases;
    this.state.silverPrices = SilverBuyTiers;

    await this.startDiscord();
    this.updateDiscordLobbyChannelUserCount();
  }

  private flagResetTime() {
    let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
    if(+theoreticalResetTime < +DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
    }

    this.resetTime = theoreticalResetTime;
  }

  tick() {
    const nowTimestamp = +DateTime.fromObject({ zone: 'utc' });

    const diff = (+this.resetTime - nowTimestamp) / 1000;
    const hours = Math.floor((diff / 60) / 60) % 60;
    const minutes = Math.floor((diff / 60)) % 60;

    if(hours === 0 && minutes <= 15 && !this.hasAlertedOfReset[0]) {
      this.hasAlertedOfReset[0] = true;
      this.broadcastSystemMessage({ message:
        `The server will reset in approximately 15 minutes (6:00 AM UTC)! 
        This is an automated restart and cannot be stopped. 
        Please prepare to exit the game soon or risk losing progress.
        Further notifications will be sent as chat messages.`
      });
    }

    if(hours === 0 && minutes <= 5 && !this.hasAlertedOfReset[1]) {
      this.hasAlertedOfReset[1] = true;
      this.addSystemMessage(`The server will reset in approximately 5 minutes (6:00 AM UTC)!`);
    }

    if(hours === 0 && minutes <= 3 && !this.hasAlertedOfReset[2]) {
      this.hasAlertedOfReset[2] = true;
      this.addSystemMessage(`The server will reset in approximately 3 minutes (6:00 AM UTC)!`);
    }

    if(hours === 0 && minutes <= 1 && !this.hasAlertedOfReset[3]) {
      this.hasAlertedOfReset[3] = true;
      this.addSystemMessage(`The server will reset in approximately 1 minute (6:00 AM UTC)!`);
    }
  }

  private async createAccount({ userId, username }): Promise<Account> {
    const account: Account = new Account({ userId, username, createdAt: Date.now(), characterNames: [], maxCharacters: 4 });
    await AccountHelper.createAccount(account);
    return account;
  }

  private async tryLogin(client, { userId, username, idToken }) {

    if(this.userIdsLoggingIn[userId]) return;
    this.userIdsLoggingIn[userId] = true;

    if(process.env.AUTH0_JWKS_URI) {
      const isValidRS256Token = await JWTHelper.verifyRS256Token(idToken);

      if(!isValidRS256Token) {
        this.send(client, {
          error: 'error_invalid_token',
          prettyErrorName: 'Invalid Auth Token',
          prettyErrorDesc: 'Stop hacking.',
          clearLoginData: true
        });

        delete this.userIdsLoggingIn[userId];
        return;
      }
    }

    const checkAccount = this.state.findAccount(userId);
    if(checkAccount) {
      this.removeUsername(username);

      const oldClient: any = find(this.clients, { userId });
      if(oldClient) {
        this.send(oldClient, {
          error: 'someone_kicked_you',
          prettyErrorName: 'Someone Kicked You',
          prettyErrorDesc: 'You have been forcibly logged out from this location.'
        });

        this.send(oldClient, { action: 'force_logout' });

        oldClient.close();

      }

    }

    let account = await AccountHelper.getAccountById(userId);

    if(!account) {
      if(!username) {
        this.send(client, { action: 'need_user_name' });
        delete this.userIdsLoggingIn[userId];
        return;

      } else {

        if(MessageHelper.hasAnyPossibleProfanity(username)) {
          this.send(client, {
            error: 'too_profane',
            prettyErrorName: 'Account Name Contains Profanity',
            prettyErrorDesc: 'If you believe your name should be allowed please contact an admin - the filters aren\'t perfect.',
            clearLoginData: true
          });
          delete this.userIdsLoggingIn[userId];
          return;
        }

        try {
          account = await this.createAccount({ userId, username });
        } catch(e) {
          this.send(client, {
            error: 'account_exists',
            prettyErrorName: 'Account Already Exists',
            prettyErrorDesc: 'Please choose a unique username.',
            clearLoginData: true
          });
        }
      }
    }

    if(!account || !account.username || !account.userId) {
      delete this.userIdsLoggingIn[userId];
      return;
    }

    await this.subscriptionHelper.checkAccountForExpiration(account);
    DiscordHelper.activateTag(account, account.discordTag);

    const { email, emailVerified } = JWTHelper.extractEmailAndVerifiedStatusFromToken(idToken);
    account.email = email;
    account.emailVerified = emailVerified;
    client.userId = account.userId;
    client.username = account.username;

    account.colyseusId = client.id;
    AccountHelper.saveAccount(account);

    this.state.addAccount(account);

    await DB.$players.update({ username: client.username }, { $set: { inGame: -1 } }, { multi: true });

    this.updateAccount(client);
    this.state.updateHashes();
    this.updateDiscordLobbyChannelUserCount();
    delete this.userIdsLoggingIn[userId];
  }

  private cleanAndSaveAccount(account: Account) {
    account.inGame = -1;
    account.colyseusId = null;
    AccountHelper.saveAccount(account);
  }

  quit(client) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    account.inGame = -1;
    AccountHelper.saveAccount(account);

    this.state.updateHashes();
    this.updateDiscordLobbyChannelUserCount();
  }

  private logout(client) {
    this.state.removeAccount(client.userId);

    const account = this.state.findAccount(client.userId);
    if(!account) return;

    this.cleanAndSaveAccount(account);
  }

  private sendMessage(client, message) {
    if(!client.username || !client.userId) return;

    this.addMessage({ account: client.username, message }, 'player');
  }

  private fixTextMessage(message: string): string {
    return MessageHelper.cleanMessage(truncate(message, { length: 500, omission: '[truncated]' }).trim());
  }

  private addMessage({ account, message }, source: 'player'|'discord') {
    message = this.fixTextMessage(message);
    if(!message) return;

    const accountRef = this.state.findAccountByUsername(account);

    if(source !== 'discord' && accountRef && !accountRef.isGM) {
      const timestamp = Date.now();

      // set the last message if not set
      if(!accountRef.lastMessage) accountRef.lastMessage = timestamp;

      // verify spam messages is num
      if(!accountRef.spamMessages) accountRef.spamMessages = 0;

      // either increment it if they're talking too much, or decrement it
      if(timestamp - accountRef.lastMessage < CHAT_SPAM_DELAY) accountRef.spamMessages++;
      else                                                     accountRef.spamMessages = Math.max(accountRef.spamMessages - 1, 0);

      // if they've finally gone over, mute em
      if(accountRef.spamMessages > MAX_SPAM_MESSAGES) {
        accountRef.isMuted = true;
        accountRef.spamMessages = 0;
        AccountHelper.saveAccount(accountRef);
      }

      // reset their timestamp
      accountRef.lastMessage = timestamp;
    }

    if(accountRef && accountRef.isMuted) return;

    this.state.addMessage({ account, message });

    if(source !== 'discord') {
      this.sendDiscordMessage(account, message);
    }

    this.broadcast({ action: 'new_message', account, message });
  }

  private viewCharacter(client, data) {
    this.send(client, { action: 'set_character', character: CharacterCreator.getCustomizedCharacter(data) });
  }

  private async createCharacter(client, { charSlot, character }) {
    character = CharacterCreator.getCustomizedCharacter(character);
    if(!character.name) {
      this.send(client, {
        error: 'invalid_char_name',
        prettyErrorName: 'Invalid Character Name',
        prettyErrorDesc: 'That character name is not valid.'
      });
      return;
    }

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
      DB.$characterSkillTrees.remove({ username: client.username, charSlot });
      TeleportHelper.removeAllTeleports(client.username, charSlot);
    }

    account.characterNames[charSlot] = character.name;
    AccountHelper.saveAccount(account);
    account.inGame = -1;

    this.updateAccount(client);

    const stats = pick(character, ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'luk', 'cha']);
    const name = character.name;
    const sex = character.sex;
    const gold = character.currentGold;
    const allegiance = character.allegiance;

    const player: Player = new Player({
      username: account.username,
      createdAt: Date.now(),
      charSlot,
      stats, sex, name, allegiance, gold,
      x: 14, y: 14, map: 'Tutorial'
    });

    await CharacterCreator.giveCharacterBasicGearAndSkills(player, this.itemCreator);

    player.pouch = await PouchHelper.loadPouchForUsername(client.username);

    const savePlayer = player.toSaveObject();

    DB.$players.insert(savePlayer);
  }

  private getCharacter(username, charSlot) {
    return DB.$players.findOne({ username, charSlot });
  }

  public saveSettings() {
    this.updateStateBonusInfo();
    DB.$lobbySettings.update({ lobby: 1 }, { $set: {
      motd: this.state.motd,
      bonus: this.bonusArbiter.allBonusData,
      bonusHours: this.bonusArbiter.boughtBonusHours
    }}, { upsert: 1 });
  }

  private updateStateBonusInfo() {
    this.state.bonusInfo = { bonus: this.bonusArbiter.allBonusData, bonusHours: this.bonusArbiter.boughtBonusHours };
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

    this.updateStateBonusInfo();
    return settings;
  }

  private async playCharacter(client, { charSlot }) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    if(account && account.inGame >= 0) {

      const isAnyoneInGame = await AccountHelper.doesAccountActuallyHaveAnyPlayersInGame(account);
      if(isAnyoneInGame) {
        this.send(client, {
          error: 'already_in_game',
          prettyErrorName: 'Already In Game',
          prettyErrorDesc: 'You are already in game. If you actually are not in game, give this a few seconds or refresh the page.'
        });
        return;
      }
    }

    const character = await this.getCharacter(client.username, charSlot);

    if(!character || character.inGame) {
      this.send(client, {
        error: 'no_character',
        prettyErrorName: 'No Character',
        prettyErrorDesc: 'There is no character in this slot (or it is already in-game). Please create one.'
      });
      return;
    }

    account.inGame = charSlot;

    this.send(client, { action: 'start_game', character });
    this.state.updateHashes();
    this.updateDiscordLobbyChannelUserCount();
  }

  onJoin(client, options) {
    this.send(client, { action: 'need_user_id' });
  }

  onLeave(client) {
    this.removeUsername((<any>client).username);
    this.state.updateHashes();
    this.updateDiscordLobbyChannelUserCount();

    const account = this.state.findAccount(client.userId);
    if(!account) return;

    this.cleanAndSaveAccount(account);
  }

  onDispose() {
    this.state.updateHashes();
    this.updateDiscordLobbyChannelUserCount();
  }

  removeUsername(username) {
    this.state.removeAccount(username);
    DB.$players.update({ username }, { $set: { inGame: -1 } }, { multi: true });
  }

  onMessage(client, data) {
    if(data.accessToken && !JWTHelper.verifyToken(data.accessToken)) {
      this.send(client, {
        error: 'error_invalid_token',
        prettyErrorName: 'Invalid Auth Token',
        prettyErrorDesc: 'Stop hacking.'
      });
      return;
    }

    if(data.action === 'heartbeat')       return;
    if(data.action === 'status')          return this.changeStatus(client, data.status);
    if(data.action === 'alert')           return this.broadcastAlert(client, data);
    if(data.action === 'play')            return this.playCharacter(client, data);
    if(data.action === 'create')          return this.createCharacter(client, data);
    if(data.action === 'logout')          return this.logout(client);
    if(data.action === 'quit')            return this.quit(client);
    if(data.action === 'motd_set')        return this.setMOTD(client, data);
    if(data.action === 'sub')             return this.handleSubscription(client, data);
    if(data.action === 'unsub')           return this.handleUnsubscription(client, data);
    if(data.action === 'silver')          return this.giveSilver(client, data);
    if(data.action === 'purchase')        return this.purchase(client, data.item);
    if(data.action === 'festival')        return this.adjustFestival(client, data.args);
    if(data.action === 'rmbuy')           return this.rmBuy(client, data.purchaseInfo);
    if(data.action === 'discord_tag')     return this.trySetDiscordTag(client, data.newTag);
    if(data.action === 'discord_online')  return this.trySetDiscordOnline(client, data.isOnline);
    if(data.action === 'mute')            return this.toggleMute(client, data.args);
    if(data.action === 'tester')          return this.toggleTester(client, data.args);
    if(data.action === 'update_account')  return this.updateAccount(client);
    if(data.userId && data.accessToken)   return this.tryLogin(client, data);
    if(data.message)                      return this.sendMessage(client, data.message);
    if(data.characterCreator)             return this.viewCharacter(client, data);
  }

  private updateAccount(client) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    this.send(client, { action: 'set_account', account: account.toSaveObject() });
  }

  private toggleTester(client, account: string) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    targetAccount.isTester = !targetAccount.isTester;
    AccountHelper.saveAccount(targetAccount);
  }

  private toggleMute(client, account: string) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    targetAccount.isMuted = !targetAccount.isMuted;
    AccountHelper.saveAccount(targetAccount);
  }

  private async trySetDiscordTag(client, newTag: string) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    if(newTag === account.discordTag) return;

    if(!newTag) {
      DiscordHelper.updateUserTag(account, account.discordTag, null);
      account.discordTag = null;
      AccountHelper.saveAccount(account);

      this.send(client, {
        error: 'discord_tag_unset',
        popupType: 'success',
        prettyErrorName: 'Tag Unset',
        prettyErrorDesc: `Discord tag unset! Your roles have all been removed.`
      });

      return;
    }

    const doesExist = await AccountHelper.doesDiscordTagExist(newTag);
    if(doesExist) {
      this.send(client, {
        error: 'discord_tag_in_use',
        prettyErrorName: 'Tag In Use',
        prettyErrorDesc: `Discord tag already in use by another user. Please select a unique discord tag.`
      });
      return;
    }

    const didWork = DiscordHelper.updateUserTag(account, account.discordTag, newTag);
    if(!didWork) {
      this.send(client, {
        error: 'discord_tag_not_valid',
        prettyErrorName: 'Tag Not Valid',
        prettyErrorDesc: `Discord tag not valid. Please verify that you've entered it correctly.`
      });
      return;
    }

    account.discordTag = newTag;
    AccountHelper.saveAccount(account);

    this.send(client, {
      error: 'discord_tag_valid',
      popupType: 'success',
      prettyErrorName: 'Tag Set',
      prettyErrorDesc: `Discord tag set! You will now be marked as verified, and if you are a subscriber, you'll get access to the subscriber-only channel.`
    });
    return;
  }

  private async trySetDiscordOnline(client, isOnline: boolean) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    account.discordOnline = isOnline;
    DiscordHelper.syncAlwaysOnlineStatus(account);
    AccountHelper.saveAccount(account);
  }

  private async rmBuy(client, purchaseInfo) {
    const account = this.state.findAccount(client.userId);
    if(!account) return;

    try {
      await this.subscriptionHelper.buyWithStripe(account, purchaseInfo);

      if(purchaseInfo.item.duration) {
        this.send(client, {
          error: 'success_stripe',
          popupType: 'success',
          prettyErrorName: 'Stripe Success',
          prettyErrorDesc: `Payment successful. Thanks for your support! 
          You are now a ${purchaseInfo.item.duration}-month subscriber to Land of the Rair! 
          You also now have ${account.silver.toLocaleString()} silver!`
        });

      } else {
        this.send(client, {
          error: 'success_stripe',
          popupType: 'success',
          prettyErrorName: 'Stripe Success',
          prettyErrorDesc: `Payment successful. Thanks for your support! You now have ${account.silver.toLocaleString()} silver!`
        });
      }
    } catch(e) {
      this.send(client, {
        error: 'error_stripe',
        prettyErrorName: 'Stripe Error',
        prettyErrorDesc: e.message
      });
    }

    this.updateAccount(client);
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

    const wasSuccess = await this.subscriptionHelper.purchaseWithSilver(account, key, this);
    if(!wasSuccess) {
      this.send(client, {
        error: 'couldnt_purchase',
        prettyErrorName: 'Purchase Failed',
        prettyErrorDesc: 'The purchase didn\'t go through. Either you don\'t have enough silver, or something else went wrong. If this problem persists, contact a GM.'
      });
    }

    this.updateAccount(client);
  }

  public updateFestivalTime(account: Account, key: 'xpMult'|'skillMult'|'goldMult'|'itemFindMult', hours = 6): void {

    this.bonusArbiter.manuallyUpdateBonusHours({ [key]: hours }, true);
    this.saveSettings();

    const hoursRemaining = this.bonusArbiter.boughtBonusHours[key];

    const msg = `${account.username} just bought ${hours} hours of ${key} +100%! There are ${hoursRemaining} hours left of the bonus.`;
    this.addSystemMessage(msg);
    this.sendDiscordEventNotification(msg);
  }

  private async giveSilver(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const { account, silver } = data;
    if(!account || !silver) return;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    this.subscriptionHelper.giveSilver(targetAccount, silver);
  }

  private async handleSubscription(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const { account } = data;
    let { period } = data;

    if(!account) return;
    if(!period) period = 30;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    await this.subscriptionHelper.startTrial(targetAccount, period);
    this.state.updateHashes();
  }

  private async handleUnsubscription(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    const { account } = data;

    const targetAccount = this.state.findAccountByUsername(account);
    if(!targetAccount) return;

    await this.subscriptionHelper.unsubscribe(targetAccount);
    this.state.updateHashes();
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

  private broadcastSystemMessage(data, sender = 'System') {
    this.broadcast({ action: 'alert', sender, message: data.message });
  }

  private broadcastAlert(client, data) {
    const gmAccount = this.state.findAccount(client.userId);
    if(!gmAccount || !gmAccount.isGM) return;

    this.broadcastSystemMessage(data, gmAccount.username);
  }

  private changeStatus(client, newStatus) {
    if(!includes(['Available', 'AFK'], newStatus)) return;

    const account = this.state.findAccount(client.userId);
    if(!account) return;

    account.status = newStatus;
    this.state.updateHashes();
  }

  // discord is optional
  private async startDiscord() {
    const didConnect = await DiscordHelper.init({
      newMessageCallback: ({ content, author, member }) => {
        const name = DiscordHelper.getDisplayNameForDiscordUser(member);
        this.addMessage({ message: content, account: DiscordHelper.formatDiscordUsernameForLobby(name) }, 'discord');
      },
      presenceUpdateCallback: () => {
        this.updateStateWithAlwaysOnlineDiscordUsers();
      }
    });

    this.state.discordConnected = didConnect;
    this.updateStateWithAlwaysOnlineDiscordUsers();
  }

  private updateStateWithAlwaysOnlineDiscordUsers() {
    this.state.setDiscordAlwaysOnlineUsers(
      DiscordHelper.getAllAlwaysOnlineMembers()
        .filter(user => user.presence.status !== 'offline')
        .map(user => {
          const name = DiscordHelper.getDisplayNameForDiscordUser(user);
          return {
            username: DiscordHelper.formatDiscordUsernameForLobby(name),
            tag: `${user.user.username}#${user.user.discriminator}`
          }
        })
    );
  }

  private sendDiscordMessage(username: string, message: string) {
    DiscordHelper.sendMessage(username, message);
  }

  private sendDiscordEventNotification(message: string) {
    DiscordHelper.sendEventNotification(message);
  }

  private updateDiscordLobbyChannelUserCount() {
    DiscordHelper.updateUserCount(this.state.accounts.length, this.state.accounts.filter(acc => acc.inGame >= 0).length);
  }
}
