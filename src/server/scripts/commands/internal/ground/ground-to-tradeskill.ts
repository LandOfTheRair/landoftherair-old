
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class GroundToTradeskill extends Command {

  public name = '~GtT';
  public format = 'ItemType ItemId ItemSlot TradeskillSlot TradeskillDestSlot AlchUUID';

  execute(player: Player, { room, args }) {
    const splitArgs = args.split(' ');

    const [itemType, itemId, tsSlot, tsDestSlot, alchUUID] = splitArgs;

    if(this.isAccessingLocker(player)) return;
    if(!itemType || !itemId || !tsSlot || isUndefined(tsDestSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    room.removeItemFromGround(item);
  }

}
