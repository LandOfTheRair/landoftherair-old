
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class EquipToLeft extends Command {

  public name = '~EtL';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = args;
    if(isUndefined(slot)) return false;

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }

    player.unequip(slot);
    player.setLeftHand(item);
  }

}
