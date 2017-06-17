
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LockerToLeft extends Command {

  public name = '~KtL';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.locker[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    player.setLeftHand(item);
    player.takeItemFromLocker(slot);
  }

}

