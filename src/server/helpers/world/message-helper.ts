
import { isString, isUndefined, startsWith, set } from 'lodash';
import { Character } from '../../../shared/models/character';
import { VisualEffect } from './visual-effects';

import { CensorSensor, CensorTier } from 'censor-sensor';
import { CharacterHelper } from '../character/character-helper';

const censor = new CensorSensor();
censor.disableTier(CensorTier.CommonProfanity);
censor.disableTier(CensorTier.PossiblyOffensive);

export class MessageHelper {

  static hasAnyPossibleProfanity(message: string): boolean {
    return censor.isProfaneIsh(message.split(' ').join(''));
  }

  static cleanMessage(message: any): string {
    if(!isUndefined(message.message)) {
      message.message = censor.cleanProfanity(message.message || '');
      return message;
    }

    return censor.cleanProfanity(message || '');
  }

  static formatMessageFor(char: Character, message: string, args: Character[]) {
    if(!args.length) return message;

    return [...args].reduce((str, c, idx) => {
      if(!c) return str;

      let name = c.name;
      if(!CharacterHelper.isAbleToSee(char) || !char.canSeeThroughStealthOf(c)) name = 'somebody';
      if(char === c) name = 'yourself';
      return str.replace(new RegExp(`%${idx}`), name);
    }, message);
  }

  static sendClientMessageBatch(char: Character, messages: any[]) {
    if(!char.isPlayer()) return;
    char.$$room.sendPlayerLogMessageBatch(char, messages);
  }

  static sendClientMessage(char: Character, message, rootCharacter?: Character) {
    if(!char.isPlayer()) return;
    char.$$room.sendPlayerLogMessage(char, message, rootCharacter);
  }

  static sendClientMessageToRadius(char: Character, message, radius = 4, except = [], useSight = false, formatArgs = [], shouldQueue = false) {
    const sendMessage = isString(message) ? { message, subClass: 'chatter' } : message;

    const charRegion = char.$$room.state.getSuccorRegion(char);

    char.$$room.state.getPlayersInRange(char, radius, except, useSight).forEach(p => {

      // prevent messages through walls
      if(p.$$room.state.getSuccorRegion(p) !== charRegion) return;

      if(formatArgs.length > 0) sendMessage.message = MessageHelper.formatMessageFor(p, sendMessage.message, formatArgs);

      // outta range, generate a "you heard X in the Y dir" message
      if(radius > 4 && char.distFrom(p) > 5) {
        const dirFrom = char.getDirBasedOnDiff(char.x - p.x, char.y - p.y);
        sendMessage.dirFrom = dirFrom.toLowerCase();
        p.sendClientMessage(sendMessage, shouldQueue);
      } else {
        p.sendClientMessage(sendMessage, shouldQueue);
      }
    });
  }

  static drawEffectInRadius(char: Character, effectName: VisualEffect, center: any, effectRadius = 0, drawRadius = 0) {
    char.$$room.state.getPlayersInRange(char, drawRadius).forEach(p => {
      p.$$room.drawEffect(p, { x: center.x, y: center.y }, effectName, effectRadius);
    });
  }

  static getPossibleMessageTargets(player: Character, findStr: string, useSight = true): any[] {
    const allTargets = player.$$room.state.getAllInRange(player, 4, [], useSight);
    const possTargets = allTargets.filter(target => {
      if(target.isDead()) return false;

      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if(useSight && !player.canSee(diffX, diffY)) return false;

      // you can always see yourself
      if(useSight && player !== target && !player.canSeeThroughStealthOf(target)) return false;

      return this.doesTargetMatchSearch(target, findStr);
    });

    return possTargets;
  }

  static getPossibleAuguryTargets(player: Character, findStr: string): any[] {
    // -1 is a special case that gets everything
    const allTargets = player.$$room.state.getAllNPCsFromQuadtrees(player, -1);
    const possTargets = allTargets.filter(target => {
      return this.doesTargetMatchSearch(target, findStr);
    });

    return possTargets;
  }

  static doesTargetMatchSearch(target: Character, findStr: string): boolean {
    return target.uuid === findStr || startsWith(target.name.toLowerCase(), findStr.toLowerCase());
  }

  static getMergeObjectFromArgs(args) {
    const matches = args.match(/(?:[^\s"']+|['"][^'"]*["'])+/g);

    const mergeObj = matches.reduce((obj, prop) => {
      const propData = prop.split('=');
      const key = propData[0];
      let val = propData[1];

      if(!val) return obj;

      val = val.trim();

      if(!isNaN(+val)) {
        val = +val;
      } else if(startsWith(val, '"')) {
        val = val.substring(1, val.length - 1);
      }

      set(obj, key.trim(), val);
      return obj;
    }, {});

    return mergeObj;
  }
}
