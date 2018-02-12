
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class TradeskillToTradeskill extends Command {

  public name = '~TtT';
  public format = 'TradeskillSlot TradeskillSrcSlot AlchUUID TradeskillDestSlot';

  execute(player: Player, { room, gameState, args }) {
    const [tsSlot, tsSrcSlot, alchUUID, tsDestSlot] = args.split(' ');
    if(!tsSlot || isUndefined(tsSrcSlot) || !alchUUID || isUndefined(tsDestSlot)) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.tradeSkillContainers[tsSlot].getItemFromSlot(+tsSrcSlot);
    if(!item) return false;

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    player.tradeSkillContainers[tsSlot].takeItemFromSlot(+tsSrcSlot);
  }

}
