
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToRight extends Command {

  public name = '~StR';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }

    player.setRightHand(item);
    player.takeItemFromSack(slot);
  }

}
