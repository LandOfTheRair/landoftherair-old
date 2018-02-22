
import * as Discord from 'discord.js';
import { Logger } from '../logger';

const DISCORD_WATCHER_ROLE_NAME = process.env.DISCORD_WATCHER_ROLE || 'Event Watcher';
const DISCORD_BOT_NAME = process.env.DISCORD_BOT_NAME || 'LandOfTheRairLobby';

export class DiscordHelper {
  private static discord: Discord.Client;
  private static discordGuild: Discord.Guild;
  private static discordChannel: Discord.GroupDMChannel;
  private static discordBotChannel: Discord.GroupDMChannel;

  private static newMessageCallback: (obj) => void;

  private static parseBotMessage({ content, channel, member }) {
    if(content !== '!events') return;

    // too lazy to do a permissions check
    try {
      const watcherRole = DiscordHelper.discordGuild.roles.find('name', DISCORD_WATCHER_ROLE_NAME);
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

  private static parseLobbyMessage({ content, author }) {
    if(author.username === DISCORD_BOT_NAME) return;

    DiscordHelper.newMessageCallback({ content, author });
  }

  public static async init({ newMessageCallback }): Promise<boolean> {
    if(!process.env.DISCORD_SECRET) return false;

    this.newMessageCallback = newMessageCallback;

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
      if(channel.id === DiscordHelper.discordChannel.id) DiscordHelper.parseLobbyMessage({ content, author });
      if(channel.id === DiscordHelper.discordBotChannel.id) DiscordHelper.parseBotMessage({ content, channel, member });
    });

    return true;
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
}
