
import { isString } from 'lodash';
import { Character } from '../../shared/models/character';
import { VisualEffect } from '../gidmetadata/visual-effects';

export class MessageHelper {

  static sendClientMessage(char: Character, message) {
    if(!char.isPlayer()) return;
    char.$$room.sendPlayerLogMessage(char, message);
  }

  static sendClientMessageToRadius(char: Character, message, radius = 0, except = []) {
    const sendMessage = isString(message) ? { message, subClass: 'chatter' } : message;

    char.$$room.state.getPlayersInRange(char, radius, except).forEach(p => {
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
}
