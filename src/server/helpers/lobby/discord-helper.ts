
import * as Discord from 'discord.js';
import { Logger } from '../../logger';
import { Account } from '../../../shared/models/account';

const DISCORD_WATCHER_ROLE_NAME = process.env.DISCORD_WATCHER_ROLE || 'Event Watcher';
const DISCORD_VERIFIED_ROLE_NAME = process.env.DISCORD_VERIFIED_ROLE || 'Verified';
const DISCORD_MUTED_ROLE_NAME = process.env.DISCORD_MUTED_ROLE || 'Muted';
const DISCORD_SUBSCRIBER_ROLE_NAME = process.env.DISCORD_SUBSCRIBER_ROLE || 'Subscriber';
const DISCORD_ONLINE_ROLE_NAME = process.env.DISCORD_ONLINE_ROLE || 'Online In Lobby';
const DISCORD_BOT_NAME = process.env.DISCORD_BOT_NAME || 'LandOfTheRairLobby';

export class DiscordHelper {
  private static discord: Discord.Client;
  private static discordGuild: Discord.Guild;
  private static discordChannel: Discord.GroupDMChannel;
  private static discordBotChannel: Discord.GroupDMChannel;

  private static newMessageCallback: (obj) => void;
  private static presenceUpdateCallback: (oldU, newU) => void;

  private static parseBotMessage({ content, channel, member }) {
    if(content !== '!events') return;

    // too lazy to do a permissions check
    try {
      const watcherRole = DiscordHelper.discordGuild.roles.find('name', DISCORD_WATCHER_ROLE_NAME);
      const hasRole = member.roles.get(watcherRole.id);

      if(hasRole) {
        member.removeRole(watcherRole);
        channel.send(`${member}, you are **no longer watching** events. You will no longer receive event notifications.`);
      } else {
        member.addRole(watcherRole);
        channel.send(`${member}, you are assigned the role ${DISCORD_WATCHER_ROLE_NAME}. You will be notified when something cool happens.`);
      }

    } catch(e) {
      console.error(e);
    }
  }

  public static getDisplayNameForDiscordUser(member: Discord.GuildMember) {
    return member.nickname || member.user.username;
  }

  public static formatDiscordUsernameForLobby(username: string): string {
    return `ᐎ${username}`;
  }

  private static parseLobbyMessage({ content, author, member }) {
    if(author.username === DISCORD_BOT_NAME) return;

    DiscordHelper.newMessageCallback({ content, author, member });
  }

  public static async init({ newMessageCallback, presenceUpdateCallback }): Promise<boolean> {
    if(!process.env.DISCORD_SECRET) return false;

    this.newMessageCallback = newMessageCallback;
    this.presenceUpdateCallback = presenceUpdateCallback;

    DiscordHelper.discord = new Discord.Client();

    try {
      await DiscordHelper.discord.login(process.env.DISCORD_SECRET);
      DiscordHelper.discordGuild = DiscordHelper.discord.guilds.get(process.env.DISCORD_GUILD);
      DiscordHelper.discordChannel = <Discord.GroupDMChannel>DiscordHelper.discord.channels.get(process.env.DISCORD_CHANNEL);
      DiscordHelper.discordBotChannel = <Discord.GroupDMChannel>DiscordHelper.discord.channels.get(process.env.DISCORD_BOT_CHANNEL);
    } catch(e) {
      Logger.error(e);
      return false;
    }

    DiscordHelper.discord.on('message', ({ content, channel, author, member }) => {
      if(!channel || !DiscordHelper.discordChannel || !DiscordHelper.discordBotChannel) return;

      if(channel.id === DiscordHelper.discordChannel.id) DiscordHelper.parseLobbyMessage({ content, author, member });
      if(channel.id === DiscordHelper.discordBotChannel.id) DiscordHelper.parseBotMessage({ content, channel, member });
    });

    DiscordHelper.discord.on('presenceUpdate', (oldMember, newMember) => {
      if(!DiscordHelper.discordChannel || !DiscordHelper.discordBotChannel) return;

      presenceUpdateCallback(oldMember, newMember);
    });

    DiscordHelper.discord.on('error', (error) => {
      Logger.error(error);
    });

    return true;
  }

  public static getAllAlwaysOnlineMembers(): Discord.GuildMember[] {
    if(!this.discord || !this.discordGuild) return [];

    return this.discordGuild.roles.find('name', DISCORD_ONLINE_ROLE_NAME).members.array();
  }

  public static sendMessage(username: string, message: string) {
    if(!DiscordHelper.discordChannel) return;

    DiscordHelper.discordChannel.send(`${username}: ${message}`);
  }

  public static sendEventNotification(message: string) {
    if(!DiscordHelper.discordChannel) return;

    const role = DiscordHelper.discordGuild.roles.find('name', DISCORD_WATCHER_ROLE_NAME);
    DiscordHelper.discordChannel.send(`${role}, ${message}`);
  }

  public static updateUserCount(newUserCount: number, inGameCount: number) {
    if(!DiscordHelper.discordChannel) return;

    (<any>DiscordHelper.discordChannel).setTopic(`${newUserCount} user(s) in lobby, ${inGameCount} player(s) in game`);
  }

  public static updateUserTag(account: Account, oldTag: string, newTag: string): boolean {
    if(!this.discord) return;

    if(oldTag) DiscordHelper.deactivateTag(account, oldTag);
    if(newTag) return DiscordHelper.activateTag(account, newTag);

    return false;
  }

  private static getUserByTag(tag: string): Discord.GuildMember {
    if(!this.discord) return null;

    const user = this.discord.users.find(u => `${u.username}#${u.discriminator}` === tag);
    if(!user) return null;

    const guildMember = this.discordGuild.members.find('id', user.id);
    return guildMember;
  }

  public static deactivateTag(account: Account, oldTag: string) {
    if(!this.discord) return;

    const guildMember = this.getUserByTag(oldTag);
    if(!guildMember) return;

    [
      DISCORD_VERIFIED_ROLE_NAME,
      DISCORD_SUBSCRIBER_ROLE_NAME,
      DISCORD_MUTED_ROLE_NAME,
      DISCORD_ONLINE_ROLE_NAME
    ].forEach(role => {
      guildMember.removeRole(this.discordGuild.roles.find('name', role));
    });
  }

  public static activateTag(account: Account, newTag: string): boolean {
    if(!this.discord) return;

    const guildMember = this.getUserByTag(newTag);
    if(!guildMember) return false;

    guildMember.addRole(this.discordGuild.roles.find('name', DISCORD_VERIFIED_ROLE_NAME));

    if(account.isMuted) {
      guildMember.addRole(this.discordGuild.roles.find('name', DISCORD_MUTED_ROLE_NAME));
    }

    if(account.discordOnline) {
      guildMember.addRole(this.discordGuild.roles.find('name', DISCORD_ONLINE_ROLE_NAME));
    }

    if(account.subscriptionTier > 0) {
      guildMember.addRole(this.discordGuild.roles.find('name', DISCORD_SUBSCRIBER_ROLE_NAME));
    } else {
      guildMember.removeRole(this.discordGuild.roles.find('name', DISCORD_SUBSCRIBER_ROLE_NAME));
    }

    return true;
  }

  public static syncAlwaysOnlineStatus(account: Account): boolean {
    if(!this.discord) return;

    const guildMember = this.getUserByTag(account.discordTag);
    if(!guildMember) return false;

    if(account.discordOnline) {
      guildMember.addRole(this.discordGuild.roles.find('name', DISCORD_ONLINE_ROLE_NAME));
    } else {
      guildMember.removeRole(this.discordGuild.roles.find('name', DISCORD_ONLINE_ROLE_NAME));
    }

    return true;

  }
}
