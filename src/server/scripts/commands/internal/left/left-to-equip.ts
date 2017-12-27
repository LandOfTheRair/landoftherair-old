
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToEquip extends Command {

  public name = '~LtE';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const item = player.leftHand;
    if(this.isAccessingLocker(player)) return;
    if(!item) return;

    const slot = +args;
    if(isUndefined(slot)) return false;

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    player.setLeftHand(null);
  }

}
