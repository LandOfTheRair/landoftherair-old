
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class TradeskillToSack extends Command {

  public name = '~TtS';
  public format = 'TradeskillSlot TradeskillSrcSlot AlchUUID';

  execute(player: Player, { room, gameState, args }) {
    const [tsSlot, tsSrcSlot, alchUUID] = args.split(' ');
    if(!tsSlot || isUndefined(tsSrcSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');



    const item = player.tradeSkillContainers[tsSlot].getItemFromSlot(+tsSrcSlot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.sack, item);
    if(!added) return;

    player.tradeSkillContainers[tsSlot].takeItemFromSlot(+tsSrcSlot);
  }

}
