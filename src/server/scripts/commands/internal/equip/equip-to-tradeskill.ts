
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class EquipToTradeskill extends Command {

  public name = '~EtT';
  public format = 'ItemSlot TradeskillSlot TradeskillDestSlot AlchUUID';

  execute(player: Player, { room, gameState, args }) {
    const [slot, tsSlot, tsDestSlot, alchUUID] = args.split(' ');
    if(!slot || !tsSlot || isUndefined(tsDestSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.gear[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    player.unequip(slot);
  }

}
