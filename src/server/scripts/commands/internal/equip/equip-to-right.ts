
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class EquipToRight extends Command {

  public name = '~EtR';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    const slot = args;
    if(this.isAccessingLocker(player)) return;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    this.trySwapRightToLeft(player);

    player.unequip(slot);
    player.setRightHand(item);
  }

}
