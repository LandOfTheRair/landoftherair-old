
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class EquipToSack extends Command {

  public name = '~EtS';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.addItemToSack(item)) return;
    player.unequip(slot);
  }

}
