
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class EquipToLeft extends Command {

  public name = '~EtL';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(player.leftHand) return room.sendClientLogMessage(client, 'Your left hand is full.');

    player.unequip(slot);
    player.setLeftHand(item);
  }

}
