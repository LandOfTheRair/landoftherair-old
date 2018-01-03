
import { isString, startsWith } from 'lodash';
import { Character } from '../../shared/models/character';
import { VisualEffect } from '../gidmetadata/visual-effects';

export class MessageHelper {

  static sendClientMessage(char: Character, message) {
    if(!char.isPlayer()) return;
    char.$$room.sendPlayerLogMessage(char, message);
  }

  static sendClientMessageToRadius(char: Character, message, radius = 0, except = []) {
    const sendMessage = isString(message) ? { message, subClass: 'chatter' } : message;

    const charRegion = char.$$room.state.getSuccorRegion(char);

    char.$$room.state.getPlayersInRange(char, radius, except).forEach(p => {

      if(char.$$room.state.getSuccorRegion(p) !== charRegion) return;

      // outta range, generate a "you heard X in the Y dir" message
      if(radius > 4 && char.distFrom(p) > 5) {
        const dirFrom = char.getDirBasedOnDiff(char.x - p.x, char.y - p.y);
        sendMessage.dirFrom = dirFrom.toLowerCase();
        p.sendClientMessage(sendMessage);
      } else {
        p.sendClientMessage(sendMessage);
      }
    });
  }

  static drawEffectInRadius(char: Character, effectName: VisualEffect, center: any, effectRadius = 0, drawRadius = 0) {
    char.$$room.state.getPlayersInRange(char, drawRadius).forEach(p => {
      p.$$room.drawEffect(p, { x: center.x, y: center.y }, effectName, effectRadius);
    });
  }

  static getPossibleMessageTargets(player: Character, findStr: string): any[] {
    findStr = findStr.trim();

    const allTargets = player.$$room.state.allPossibleTargets;
    const possTargets = allTargets.filter(target => {
      if(target.isDead()) return;

      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if(!player.canSee(diffX, diffY)) return false;
      if(!player.canSeeThroughStealthOf(target)) return false;

      return this.doesTargetMatchSearch(target, findStr);
    });

    return possTargets;
  }

  static doesTargetMatchSearch(target: Character, findStr: string): boolean {
    return target.uuid === findStr || startsWith(target.name.toLowerCase(), findStr.toLowerCase());
  }
}
