
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class EquipToGround extends Command {

  public name = '~EtG';
  public format = 'ItemSlot';

  execute(player: Player, { room, args }) {
    const slot = args;
    if(this.isAccessingLocker(player)) return;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    player.unequip(slot);
  }

}
