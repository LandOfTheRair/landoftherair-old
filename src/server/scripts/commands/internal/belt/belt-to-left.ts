
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToLeft extends Command {

  public name = '~BtL';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.belt[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    player.setLeftHand(item);
    player.takeItemFromBelt(slot);
  }

}
