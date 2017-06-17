
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LockerToEquip extends Command {

  public name = '~KtE';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.locker[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');
    if(!player.canEquip(item)) return room.sendClientLogMessage(client, 'You cannot equip that item.');

    player.equip(item);
    player.takeItemFromLocker(slot);
  }

}
