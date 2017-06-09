
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToEquip extends Command {

  public name = '~RtE';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.rightHand;
    if(!item) return false;

    if(!player.canEquip(item)) return room.sendClientLogMessage(client, 'You cannot equip that item.');

    player.equip(item);
    player.rightHand = null;
  }

}
