
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class TradeskillToGround extends Command {

  public name = '~TtG';
  public format = 'TradeskillSlot TradeskillSrcSlot AlchUUID';

  execute(player: Player, { room, args }) {

    const [tsSlot, tsSrcSlot, alchUUID] = args.split(' ');
    if(!tsSlot || isUndefined(tsSrcSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.tradeSkillContainers[tsSlot].getItemFromSlot(+tsSrcSlot);
    if(!item) return false;

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    player.tradeSkillContainers[tsSlot].takeItemFromSlot(+tsSrcSlot);
  }

}
