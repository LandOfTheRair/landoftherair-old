
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToTradeskill extends Command {

  public name = '~StT';
  public format = 'ItemSlot TradeskillSlot TradeskillDestSlot AlchUUID';

  execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;
    const [sackSlot, tsSlot, tsDestSlot, alchUUID] = args.split(' ');
    if(isUndefined(sackSlot) || !tsSlot || isUndefined(tsDestSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.sack.getItemFromSlot(+sackSlot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    player.sack.takeItemFromSlot(+sackSlot);
  }

}
