
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToEquip extends Command {

  public name = '~RtE';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;

    const item = player.rightHand;
    if(!item) return;

    const slot = +args;
    if(isUndefined(slot)) return false;

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.setRightHand(null);
    player.equip(item);
  }

}
