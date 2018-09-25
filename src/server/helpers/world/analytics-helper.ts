

import * as GameAnalytics from 'gameanalytics-node-sdk';
import { includes } from 'lodash';

import { Player } from '../../../shared/models/player';
import { Character } from '../../../shared/models/character';
import { NPC } from '../../../shared/models/npc';
import { Command } from '../../base/Command';

const packageJSON = require('../../../../package.json');

export class AnalyticsHelper {

  private ga: GameAnalytics;

  constructor() {
    if(!process.env.GAMEANALYTICS_GAME_KEY || !process.env.GAMEANALYTICS_SECRET_KEY) return;

    this.ga = new GameAnalytics({
      key: process.env.GAMEANALYTICS_GAME_KEY,
      secret: process.env.GAMEANALYTICS_SECRET_KEY,
      build: packageJSON.version,
      sandbox: false
    });
  }

  // CALLED FROM IN GAME
  private userString(player: Player) {
    return `${player.username}`;
  }

  startGameSession(player: Player, ua: string) {
    if(!this.ga) return;

    this.ga.sessionStart(this.userString(player), {
      ua,
      sdk_version: 'rest api v2',
      session_num: 1
    });

    this.trackMapEnter(player);
  }

  stopGameSession(player: Player) {
    if(!this.ga) return;

    this.ga.sessionEnd(this.userString(player));
  }

  private track(player: Player, type: 'design'|'resource', args: any) {
    if(!this.ga) return;

    if(args.event_id) args.event_id = args.event_id.split(' ').join('');

    this.ga.track(type, this.userString(player), args);
  }

  // Map:{Instance|Static}:{MapName}
  private getMapPrefix(player: Player) {
    return `Map:${includes(player.map, '-') ? 'Instance' : 'Static'}:${player.map}`;
  }

  // Player:{Class}
  private getPlayerPrefix(player: Player) {
    return `Player:${player.baseClass}`;
  }

  // USES: MAP
  public trackMapEnter(player: Player) {
    this.track(player, 'design', { event_id: `${this.getMapPrefix(player)}:Enter` });
  }

  // USES: PLAYER
  public trackKill(dead: Character, killer: Character) {

    if(!dead || !killer) return;

    if(dead.isPlayer() && !killer.isPlayer()) {
      this.track(<Player>dead, 'design', { event_id: `${this.getPlayerPrefix(<Player>dead)}:Killed:${(<NPC>killer).npcId}` });
    }

    if(killer.isPlayer() && !dead.isPlayer()) {
      this.track(<Player>dead, 'design', { event_id: `${this.getPlayerPrefix(<Player>killer)}:Kill:${(<NPC>dead).npcId}` });
    }

    if(killer === dead) {
      this.track(<Player>dead, 'design', { event_id: `${this.getPlayerPrefix(<Player>killer)}:KillSelf` });
    }

  }

  public trackSkill(player: Player, cmd: Command) {
    if(!cmd.requiresLearn) return;

    this.track(player, 'design', { event_id: `${this.getPlayerPrefix(player)}:Skill:${cmd.constructor.name}` });
  }

  public trackNPCChat(player: Player, npc: NPC, cmd: string) {
    if(cmd === 'hello') return;

    const displayCmd = cmd.split(' ')[0];
    this.track(player, 'design', { event_id: `NPC:Talk:${npc.npcId}:${displayCmd}` });
  }

  public trackCurrencySink(type: 'Source'|'Sink', player: Player, currency: string, gold: number, reason: string) {
    if(gold === 0 || !reason) return;

    this.track(player, 'resource', { event_id: `${type}:${currency}:${reason}`, amount: type === 'Source' ? gold : -gold });
  }

  public trackTutorial(player: Player, step: string) {
    this.track(player, 'design', { event_id: `Tutorial:${step}` });
  }

}
